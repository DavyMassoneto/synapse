using System;
using System.Collections.Generic;
using System.Threading;

namespace SynapseUnityBridge
{
    internal sealed class ClientRegistry
    {
        private readonly object gate = new object();
        private readonly List<ClientSession> sessions = new List<ClientSession>();
        private readonly int maximum;
        private bool closed;

        internal ClientRegistry(int maximum)
        {
            this.maximum = maximum;
        }

        internal int Count
        {
            get
            {
                lock (gate) return sessions.Count;
            }
        }

        internal bool TryAdd(ClientSession session)
        {
            lock (gate)
            {
                if (closed || sessions.Count >= maximum) return false;
                sessions.Add(session);
                return true;
            }
        }

        internal void Remove(ClientSession session)
        {
            lock (gate) sessions.Remove(session);
        }

        internal void CloseAll(int timeoutMs)
        {
            ClientSession[] snapshot;
            lock (gate)
            {
                closed = true;
                snapshot = sessions.ToArray();
                sessions.Clear();
            }
            for (int index = 0; index < snapshot.Length; index++) snapshot[index].Close();
            DateTime deadline = DateTime.UtcNow.AddMilliseconds(timeoutMs);
            int remaining = 0;
            for (int index = 0; index < snapshot.Length; index++)
            {
                int budget = (int)(deadline - DateTime.UtcNow).TotalMilliseconds;
                if (budget <= 0 || !snapshot[index].Join(budget)) remaining++;
            }
            if (remaining > 0) BridgeLog.Write("CLIENTS_STILL_RUNNING count=" + remaining);
        }
    }
}
