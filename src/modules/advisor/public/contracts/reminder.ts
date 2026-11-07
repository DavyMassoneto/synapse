export interface ReminderControl {
  reset(): void;
}

export interface ReminderTurn {
  completed: boolean;
  usedTools: boolean;
}
