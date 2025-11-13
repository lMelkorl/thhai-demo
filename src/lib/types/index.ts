export type UserType = 'tuketici' | 'hakem';

export interface ConsumerRequest {
	userType: 'tuketici';
	city: string;
	amount: number;
	story: string;
	conversationHistory?: Message[];
}

export interface RefereeRequest {
	userType: 'hakem';
	applicationText: string;
	disputeSubject: string;
}

export interface Message {
	role: 'user' | 'assistant';
	content: string;
}

export interface AIResponse {
	needsMoreInfo: boolean;
	questions: string[] | null;
	analysis: {
		basvuruOzeti: string;
		olaylarinGelisimi: string;
		tuketiciTalebi: string;
		uygulanacakMevzuat: string[];
		sonuc: string;
		resmiBasvuruMetni: string;
	} | null;
}
