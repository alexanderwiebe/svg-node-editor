export interface HomeState {
  message: string;
  loading: boolean;
  error: string | null;
}

export const initialHomeState: HomeState = {
  message: '',
  loading: false,
  error: null
};
