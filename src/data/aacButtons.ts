export interface AACButtonEntry {
  row: number;
  col: number;
  label: string;
  iconName?: string;
  color?: string;
}

export const DEFAULT_BUTTONS: AACButtonEntry[] = [
  { row: 2, col: 1, label: "Yes", iconName: "Check", color: "bg-green-600/40 border-green-500/50 hover:bg-green-500/60" },
  { row: 2, col: 2, label: "No", iconName: "X", color: "bg-red-600/40 border-red-500/50 hover:bg-red-500/60" },
  { row: 2, col: 3, label: "Help", iconName: "HelpCircle", color: "bg-yellow-600/40 border-yellow-500/50 hover:bg-yellow-500/60" },
  { row: 2, col: 4, label: "More", iconName: "Plus", color: "bg-blue-600/40 border-blue-500/50 hover:bg-blue-500/60" },
  { row: 2, col: 5, label: "Stop", iconName: "StopCircle", color: "bg-orange-600/40 border-orange-500/50 hover:bg-orange-500/60" },
  { row: 2, col: 6, label: "Go", iconName: "Play", color: "bg-green-600/40 border-green-500/50 hover:bg-green-500/60" },
  { row: 2, col: 7, label: "Eat", iconName: "Utensils" },
  { row: 2, col: 8, label: "Drink", iconName: "Cup" },
  { row: 2, col: 9, label: "Sleep", iconName: "Moon" },
  { row: 2, col: 10, label: "Play", iconName: "Gamepad2" },
  { row: 2, col: 11, label: "Music", iconName: "Music" },
  { row: 2, col: 12, label: "Book", iconName: "BookOpen" },
  { row: 3, col: 1, label: "Happy", iconName: "Smile" },
  { row: 3, col: 2, label: "Sad", iconName: "Frown" },
  { row: 3, col: 3, label: "Angry", iconName: "Flame" },
  { row: 3, col: 4, label: "Scared", iconName: "AlertTriangle" },
  { row: 3, col: 5, label: "Tired", iconName: "Battery" },
  { row: 3, col: 6, label: "Sick", iconName: "Thermometer" },
  { row: 3, col: 7, label: "Hurt", iconName: "AlertCircle" },
  { row: 3, col: 8, label: "Cold", iconName: "Snowflake" },
  { row: 3, col: 9, label: "Hot", iconName: "Sun" },
  { row: 3, col: 10, label: "Home", iconName: "Home" },
  { row: 3, col: 11, label: "School", iconName: "School" },
  { row: 3, col: 12, label: "Doctor", iconName: "Stethoscope" },
  { row: 4, col: 1, label: "Mom", iconName: "User" },
  { row: 4, col: 2, label: "Dad", iconName: "User" },
  { row: 4, col: 3, label: "Friend", iconName: "Users" },
  { row: 4, col: 4, label: "Teacher", iconName: "GraduationCap" },
  { row: 4, col: 5, label: "Dog", iconName: "PawPrint" },
  { row: 4, col: 6, label: "Cat", iconName: "Cat" },
  { row: 4, col: 7, label: "Car", iconName: "Car" },
  { row: 4, col: 8, label: "Bus", iconName: "Bus" },
  { row: 4, col: 9, label: "Bike", iconName: "Bike" },
  { row: 4, col: 10, label: "Walk", iconName: "Footprints" },
  { row: 4, col: 11, label: "Run", iconName: "Zap" },
  { row: 4, col: 12, label: "Swim", iconName: "Waves" },
];
