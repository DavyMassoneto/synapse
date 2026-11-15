
#include <windows.h>
#include <stdio.h>
#include <string.h>

typedef void MonoDomain;
typedef void MonoAssembly;
typedef void MonoImage;
typedef void MonoClass;
typedef void MonoMethod;
typedef void MonoObject;
typedef void MonoProperty;
typedef void MonoString;

typedef MonoDomain* (*mono_get_root_domain_fn)();
typedef MonoDomain* (*mono_thread_attach_fn)(MonoDomain* domain);
typedef MonoImage* (*mono_image_open_from_data_with_name_fn)(char* data, unsigned int data_len, int need_copy, int* status, int ref_only, const char* name);
typedef MonoAssembly* (*mono_assembly_load_from_full_fn)(MonoImage* image, const char* filename, int* status, int ref_only);
typedef MonoImage* (*mono_assembly_get_image_fn)(MonoAssembly* assembly);
typedef MonoClass* (*mono_class_from_name_fn)(MonoImage* image, const char* name_space, const char* name);
typedef MonoMethod* (*mono_class_get_method_from_name_fn)(MonoClass* klass, const char* name, int param_count);
typedef MonoObject* (*mono_runtime_invoke_fn)(MonoMethod* method, void* obj, void** params, MonoObject** exc);
typedef MonoClass* (*mono_object_get_class_fn)(MonoObject* object);
typedef const char* (*mono_class_get_name_fn)(MonoClass* klass);
typedef char* (*mono_string_to_utf8_fn)(MonoString* string);
typedef MonoProperty* (*mono_class_get_property_from_name_fn)(MonoClass* klass, const char* name);
typedef MonoObject* (*mono_property_get_value_fn)(MonoProperty* property, void* object, void** params, MonoObject** exc);

struct SynapseInvokeRequest
{
    const char* assembly_path;
    const char* namespace_name;
    const char* class_name;
    const char* method_name;
    const char* log_path;
    int result_code;
    char message[1024];
};

namespace
{
    void AppendLog(const char* logPath, const char* text)
    {
        if (logPath == NULL || text == NULL) return;
        HANDLE handle = CreateFileA(logPath, FILE_APPEND_DATA, FILE_SHARE_READ | FILE_SHARE_WRITE,
                                   NULL, OPEN_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
        if (handle == INVALID_HANDLE_VALUE) return;
        DWORD written = 0;
        SetFilePointer(handle, 0, NULL, FILE_END);
        WriteFile(handle, text, (DWORD)strlen(text), &written, NULL);
        WriteFile(handle, "\r\n", 2, &written, NULL);
        CloseHandle(handle);
    }

    void SetMessage(SynapseInvokeRequest* request, const char* text)
    {
        if (request == NULL) return;
        strncpy_s(request->message, sizeof(request->message), text, _TRUNCATE);
    }

    const char* DescribeException(mono_object_get_class_fn getClass, mono_class_get_name_fn getName,
                                  mono_class_get_property_from_name_fn getProperty,
                                  mono_property_get_value_fn getPropertyValue,
                                  mono_string_to_utf8_fn stringToUtf8,
                                  MonoObject* exception, char* buffer, size_t bufferSize)
    {
        buffer[0] = '\0';
        MonoClass* klass = getClass(exception);
        const char* typeName = klass != NULL ? getName(klass) : "unknown";
        char message[768];
        message[0] = '\0';
        if (klass != NULL)
        {
            MonoProperty* property = getProperty(klass, "Message");
            if (property != NULL)
            {
                MonoObject* exceptionOut = NULL;
                MonoObject* value = getPropertyValue(property, exception, NULL, &exceptionOut);
                if (value != NULL && exceptionOut == NULL)
                {
                    char* utf8 = stringToUtf8((MonoString*)value);
                    if (utf8 != NULL)
                    {
                        strncpy_s(message, sizeof(message), utf8, _TRUNCATE);
                    }
                }
            }
        }
        _snprintf_s(buffer, bufferSize, _TRUNCATE, "%s: %s", typeName, message);
        return buffer;
    }

    bool ReadWholeFile(const char* path, unsigned char** data, unsigned int* size)
    {
        HANDLE handle = CreateFileA(path, GENERIC_READ, FILE_SHARE_READ | FILE_SHARE_WRITE, NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
        if (handle == INVALID_HANDLE_VALUE) return false;
        DWORD length = GetFileSize(handle, NULL);
        if (length == INVALID_FILE_SIZE || length == 0)
        {
            CloseHandle(handle);
            return false;
        }
        unsigned char* buffer = (unsigned char*)HeapAlloc(GetProcessHeap(), 0, length);
        if (buffer == NULL)
        {
            CloseHandle(handle);
            return false;
        }
        DWORD read = 0;
        BOOL ok = ReadFile(handle, buffer, length, &read, NULL);
        CloseHandle(handle);
        if (!ok || read != length)
        {
            HeapFree(GetProcessHeap(), 0, buffer);
            return false;
        }
        *data = buffer;
        *size = (unsigned int)length;
        return true;
    }
}

extern "C" __declspec(dllexport) int __stdcall SynapseModuleVersion()
{
    return 10000;
}

extern "C" __declspec(dllexport) int __stdcall SynapseInvoke(SynapseInvokeRequest* request)
{
    if (request == NULL)
    {
        return 1;
    }
    request->result_code = 0;
    request->message[0] = '\0';

    AppendLog(request->log_path, "NATIVE_INVOKE_ENTER");

    HMODULE mono = GetModuleHandleA("mono.dll");
    if (mono == NULL)
    {
        request->result_code = 2;
        SetMessage(request, "mono.dll not loaded in target process");
        AppendLog(request->log_path, request->message);
        return 2;
    }

    mono_get_root_domain_fn getRootDomain = (mono_get_root_domain_fn)GetProcAddress(mono, "mono_get_root_domain");
    mono_thread_attach_fn threadAttach = (mono_thread_attach_fn)GetProcAddress(mono, "mono_thread_attach");
    mono_image_open_from_data_with_name_fn imageOpenFromData =
        (mono_image_open_from_data_with_name_fn)GetProcAddress(mono, "mono_image_open_from_data_with_name");
    mono_assembly_load_from_full_fn assemblyLoadFromFull =
        (mono_assembly_load_from_full_fn)GetProcAddress(mono, "mono_assembly_load_from_full");
    mono_assembly_get_image_fn getImage = (mono_assembly_get_image_fn)GetProcAddress(mono, "mono_assembly_get_image");
    mono_class_from_name_fn classFromName = (mono_class_from_name_fn)GetProcAddress(mono, "mono_class_from_name");
    mono_class_get_method_from_name_fn getMethod = (mono_class_get_method_from_name_fn)GetProcAddress(mono, "mono_class_get_method_from_name");
    mono_runtime_invoke_fn runtimeInvoke = (mono_runtime_invoke_fn)GetProcAddress(mono, "mono_runtime_invoke");
    mono_object_get_class_fn objectGetClass = (mono_object_get_class_fn)GetProcAddress(mono, "mono_object_get_class");
    mono_class_get_name_fn classGetName = (mono_class_get_name_fn)GetProcAddress(mono, "mono_class_get_name");
    mono_string_to_utf8_fn stringToUtf8 = (mono_string_to_utf8_fn)GetProcAddress(mono, "mono_string_to_utf8");
    mono_class_get_property_from_name_fn getProperty = (mono_class_get_property_from_name_fn)GetProcAddress(mono, "mono_class_get_property_from_name");
    mono_property_get_value_fn getPropertyValue = (mono_property_get_value_fn)GetProcAddress(mono, "mono_property_get_value");

    if (getRootDomain == NULL || threadAttach == NULL || imageOpenFromData == NULL || assemblyLoadFromFull == NULL ||
        getImage == NULL || classFromName == NULL || getMethod == NULL || runtimeInvoke == NULL)
    {
        request->result_code = 3;
        SetMessage(request, "missing required mono export");
        AppendLog(request->log_path, request->message);
        return 3;
    }

    MonoDomain* root = getRootDomain();
    if (root == NULL)
    {
        request->result_code = 4;
        SetMessage(request, "mono_get_root_domain returned NULL");
        AppendLog(request->log_path, request->message);
        return 4;
    }
    threadAttach(root);

    unsigned char* rawData = NULL;
    unsigned int rawSize = 0;
    if (!ReadWholeFile(request->assembly_path, &rawData, &rawSize))
    {
        request->result_code = 5;
        SetMessage(request, "cannot read assembly file");
        AppendLog(request->log_path, request->message);
        return 5;
    }
    SYSTEMTIME now;
    GetSystemTime(&now);
    char imageName[512];
    _snprintf_s(imageName, sizeof(imageName), _TRUNCATE, "%s.inj%04d%02d%02dT%02d%02d%02d%03d.dll",
                request->class_name, now.wYear, now.wMonth, now.wDay, now.wHour, now.wMinute, now.wSecond, now.wMilliseconds);

    int status = 0;
    MonoImage* rawImage = imageOpenFromData((char*)rawData, rawSize, 1, &status, 0, imageName);
    HeapFree(GetProcessHeap(), 0, rawData);
    if (rawImage == NULL)
    {
        request->result_code = 6;
        char buffer[512];
        _snprintf_s(buffer, sizeof(buffer), _TRUNCATE, "mono_image_open_from_data_with_name failed status=%d", status);
        SetMessage(request, buffer);
        AppendLog(request->log_path, request->message);
        return 6;
    }
    status = 0;
    MonoAssembly* assembly = assemblyLoadFromFull(rawImage, imageName, &status, 0);
    if (assembly == NULL)
    {
        request->result_code = 7;
        char buffer[512];
        _snprintf_s(buffer, sizeof(buffer), _TRUNCATE, "mono_assembly_load_from_full failed status=%d", status);
        SetMessage(request, buffer);
        AppendLog(request->log_path, request->message);
        return 7;
    }
    AppendLog(request->log_path, "NATIVE_ASSEMBLY_OPENED");

    MonoImage* image = getImage(assembly);
    if (image == NULL)
    {
        request->result_code = 8;
        SetMessage(request, "mono_assembly_get_image returned NULL");
        AppendLog(request->log_path, request->message);
        return 8;
    }

    MonoClass* klass = classFromName(image, request->namespace_name, request->class_name);
    if (klass == NULL)
    {
        request->result_code = 9;
        SetMessage(request, "class not found in assembly");
        AppendLog(request->log_path, request->message);
        return 9;
    }

    MonoMethod* method = getMethod(klass, request->method_name, 0);
    if (method == NULL)
    {
        request->result_code = 10;
        SetMessage(request, "method not found (expected static void with zero parameters)");
        AppendLog(request->log_path, request->message);
        return 10;
    }

    MonoObject* exception = NULL;
    runtimeInvoke(method, NULL, NULL, &exception);
    if (exception != NULL)
    {
        char description[1024];
        if (objectGetClass != NULL && classGetName != NULL && stringToUtf8 != NULL && getProperty != NULL && getPropertyValue != NULL)
        {
            DescribeException(objectGetClass, classGetName, getProperty, getPropertyValue, stringToUtf8,
                              exception, description, sizeof(description));
        }
        else
        {
            strcpy_s(description, sizeof(description), "managed exception (details unavailable)");
        }
        request->result_code = 11;
        SetMessage(request, description);
        AppendLog(request->log_path, description);
        return 11;
    }

    AppendLog(request->log_path, "NATIVE_INVOKE_OK");
    return 0;
}

BOOL WINAPI DllMain(HINSTANCE instance, DWORD reason, LPVOID reserved)
{
    (void)instance;
    (void)reserved;
    if (reason == DLL_PROCESS_ATTACH)
    {
        DisableThreadLibraryCalls(instance);
    }
    return TRUE;
}
