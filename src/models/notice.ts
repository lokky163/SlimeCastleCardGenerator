export type NoticeTone = 'success' | 'error';

export interface NoticeData {
  tone: NoticeTone;
  title: string;
  text: string;
}
