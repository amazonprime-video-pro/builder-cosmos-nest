export type Subject =
  | "Math"
  | "Science"
  | "Hindi"
  | "English"
  | "Sanskrit"
  | "Social Science"
  | "Art"
  | "Vocation"
  | "Digital Literacy"
  | "Sports";

export const SUBJECTS: Subject[] = [
  "Math",
  "Science",
  "Hindi",
  "English",
  "Sanskrit",
  "Social Science",
  "Art",
  "Vocation",
  "Digital Literacy",
  "Sports",
];

export type WorkType = "Homework" | "Classwork";

export const SUBJECT_COLOR_VAR: Record<Subject, string> = {
  Math: "var(--subject-math)",
  Science: "var(--subject-science)",
  Hindi: "var(--subject-hindi)",
  English: "var(--subject-english)",
  "Social Science": "var(--subject-social)",
  Sanskrit: "var(--subject-sanskrit)",
  Art: "var(--subject-art)",
  Vocation: "var(--subject-vocation)",
  "Digital Literacy": "var(--subject-digital)",
  Sports: "var(--subject-sports)",
};
