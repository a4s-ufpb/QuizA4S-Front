// Domain models and shared API types for the Quiz A4S frontend.

export type HttpMethod = "get" | "post" | "patch" | "delete";

/** Standard envelope returned by the axios-based services. */
export interface ApiResult<T> {
  data: T;
  message: string;
  success: boolean;
}

/** Result shape returned by the fetch-based {@link ApiFetch} helper. */
export interface ApiFetchResult<T> {
  message: string;
  success: boolean;
  data: T[];
  totalPages: number;
}

/** Spring Data style paginated payload. */
export interface Page<T> {
  content: T[];
  totalPages: number;
}

export type Role = "ADMIN" | "USER";

export interface User {
  uuid: string;
  name: string;
  email: string;
  role?: Role;
  likes?: number;
}

export type GameMode = "SINGLE_PLAYER" | "MULTIPLAYER";

export interface Theme {
  id: number;
  name: string;
  imageUrl: string;
}

export interface Alternative {
  id?: number;
  text: string;
  correct: boolean;
}

// Questão pra jogar o quiz single-player — imagens já vêm como URLs do MinIO.
export interface QuizQuestion {
  id: number;
  title: string;
  imageUrl: string;
  imageOneUrl?: string;
  imageTwoUrl?: string;
  imagesOrder?: string;
  alternatives: Alternative[];
}

export interface Question {
  id: number;
  title: string;
  imageUrl: string;
  imageOneUrl?: string;
  imageTwoUrl?: string;
  imagesOrder?: string;
  creatorId?: string;
  alternatives?: Alternative[];
  theme?: Theme;
}

export interface Score {
  id: number;
  result: number;
  user: User;
}

export interface ScoreRequest {
  numberOfHits: number;
  totalTime: number;
}

export interface Statistic {
  id: number;
  studentName: string;
  themeName: string;
  date: string;
  percentagemOfHits: number;
}

export interface StatisticRequest {
  studentName: string;
  themeName: string;
  percentagemOfHits: number;
}

export interface ResponseStatistic {
  questionId: number;
  questionTitle: string;
  totalOfAnswers: number;
  totalOfCorrectAnswers: number;
  totalOfIncorrectAnswers: number;
  percentageOfAnswersCorrect: number;
  percentageOfAnswersIncorrect: number;
}

export interface MySummary {
  totalQuizzesFinished: number;
  totalCorrectAnswers: number;
  totalWrongAnswers: number;
}

export interface ResponseItem {
  id: number;
  dateTime: string;
  user: User;
  question: {
    title: string;
    imageUrl?: string;
    imageOneUrl?: string;
    imageTwoUrl?: string;
    imagesOrder?: string;
    theme: { name: string };
  };
  alternative: {
    text: string;
    correct: boolean;
  };
  questionAlternatives: Alternative[];
}

export interface AuthResponse {
  token?: string;
}

/** Field descriptor consumed by {@link UpdateBox}. */
export interface InputField {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  maxLength: number;
  minLength: number;
}

/** Field descriptor consumed by {@link FormTemplate}. */
export interface FormField {
  name: string;
  label: string;
  type: string;
  placeholder: string;
}

export interface InformationData {
  text: string;
  icon: string;
  color: string;
}

// --- Pexels image search ---

export interface PexelsPhoto {
  id: number;
  alt: string;
  src: {
    medium: string;
  };
}

export interface PexelsSearchResult {
  total_results: number;
  photos: PexelsPhoto[];
}
