import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Together from 'together-ai';
import { CONSUMER_SYSTEM_PROMPT, ARBITRATOR_SYSTEM_PROMPT, TOGETHER_MODEL } from '$lib/config/system-prompt';
import type { ConsumerRequest, RefereeRequest, AIResponse } from '$lib/types';
import { env } from '$env/dynamic/private';

const together = new Together({
	apiKey: env.TOGETHER_API_KEY || ''
});

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		
		// Validate request
		if (!body.userType || (body.userType !== 'tuketici' && body.userType !== 'hakem')) {
			throw error(400, 'Geçersiz kullanıcı tipi');
		}

		let userMessage: string;
		const conversationHistory = body.conversationHistory || [];

		if (body.userType === 'tuketici') {
			const req = body as ConsumerRequest;
			
			if (!req.city || !req.amount || !req.story) {
				throw error(400, 'Şehir, tutar ve hikaye bilgisi gereklidir');
			}

			userMessage = `
TÜKETİCİ BAŞVURUSU

Şehir: ${req.city}
Uyuşmazlık Bedeli: ${req.amount} TL

Olay Anlatımı:
${req.story}

Lütfen bu başvuruyu analiz et ve eğer eksik bilgi varsa sor. Yeterli bilgi varsa resmi başvuru metnini hazırla.
`;
		} else {
			const req = body as RefereeRequest;
			
			if (!req.applicationText || !req.disputeSubject) {
				throw error(400, 'Başvuru metni ve uyuşmazlık konusu gereklidir');
			}

			userMessage = `
HAKEM HEYETİ İNCELEMESİ

Uyuşmazlık Konusu: ${req.disputeSubject}

Başvuru Metni:
${req.applicationText}

Lütfen bu başvuruyu incele ve tarafsız bir ön analiz raporu hazırla.
`;
		}

		// Select system prompt based on user type
		const systemPrompt = body.userType === 'tuketici' 
			? CONSUMER_SYSTEM_PROMPT 
			: ARBITRATOR_SYSTEM_PROMPT;

		// Build messages array
		const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
			{ role: 'system', content: systemPrompt }
		];

		// Add conversation history if exists
		conversationHistory.forEach((msg: { role: 'user' | 'assistant'; content: string }) => {
			messages.push(msg);
		});

		// Add current user message
		messages.push({ role: 'user', content: userMessage });

		// Call Together AI
		const response = await together.chat.completions.create({
			model: TOGETHER_MODEL,
			messages,
			max_tokens: 4096,
			temperature: 0.15,
			top_p: 0.85,
			response_format: { type: 'json_object' }
		});

		const content = response.choices[0]?.message?.content;
		
		if (!content) {
			throw error(500, 'AI yanıtı alınamadı');
		}

		// Parse JSON response
		let aiResponse: AIResponse;
		try {
			aiResponse = JSON.parse(content);
			
			// Validate response structure
			if (!aiResponse.needsMoreInfo && aiResponse.analysis) {
				// Ensure uygulanacakMevzuat is an array of strings
				if (!Array.isArray(aiResponse.analysis.uygulanacakMevzuat)) {
					console.error('Invalid uygulanacakMevzuat:', aiResponse.analysis.uygulanacakMevzuat);
					throw new Error('uygulanacakMevzuat must be a string array');
				}
			}
		} catch (e) {
			console.error('JSON parse/validation error:', e);
			console.error('Raw content:', content);
			throw error(500, `AI yanıtı işlenirken hata oluştu: ${e instanceof Error ? e.message : 'Unknown error'}`);
		}

		return json({
			success: true,
			data: aiResponse
		});

	} catch (e: any) {
		console.error('API Error:', e);
		
		if (e.status) {
			throw e;
		}
		
		throw error(500, e.message || 'Bir hata oluştu');
	}
};
