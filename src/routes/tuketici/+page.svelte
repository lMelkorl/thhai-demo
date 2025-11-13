<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import * as Accordion from "$lib/components/ui/accordion";
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea";
	import { Label } from "$lib/components/ui/label";
	import { ArrowLeft, Send, Loader2, FileText } from "lucide-svelte";
	import type { AIResponse, Message } from "$lib/types";

	let city = $state("");
	let amount = $state("");
	let story = $state("");
	let loading = $state(false);
	let result: AIResponse | null = $state(null);
	let conversationHistory: Message[] = $state([]);
	let followUpAnswers = $state<string[]>([]);
	
	async function handleSubmit() {
		if (!city || !amount || !story) {
			alert("Lütfen tüm alanları doldurun");
			return;
		}

		loading = true;
		result = null;

		try {
			const response = await fetch('/api/analyze', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					userType: 'tuketici',
					city,
					amount: parseFloat(amount),
					story,
					conversationHistory
				})
			});

			const data = await response.json();
			
			if (!response.ok) {
				throw new Error(data.message || 'Bir hata oluştu');
			}

			result = data.data;
		
			// Add to conversation history
			conversationHistory.push({
				role: 'user',
				content: story
			});
		
			if (result?.needsMoreInfo && result.questions) {
				conversationHistory.push({
					role: 'assistant',
					content: JSON.stringify(result.questions)
				});
				// Initialize followUpAnswers array with empty strings
				followUpAnswers = Array(result.questions.length).fill('');
			}
		} catch (error: any) {
			alert(error.message || 'Bir hata oluştu');
		} finally {
			loading = false;
		}
	}

	async function handleFollowUp() {
		// Check if all questions are answered
		const allAnswered = followUpAnswers.every(answer => answer.trim());
		if (!allAnswered) {
			alert("Lütfen tüm soruları yanıtlayın");
			return;
		}

		loading = true;
		const previousResult = result;
		result = null;

		try {
			// Combine all answers into one message
			const combinedAnswers = followUpAnswers.join(", ");
			
			// Add follow-up answer to conversation
			conversationHistory.push({
				role: 'user',
				content: combinedAnswers
			});

			const response = await fetch('/api/analyze', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					userType: 'tuketici',
					city,
					amount: parseFloat(amount),
					story: combinedAnswers,
					conversationHistory
				})
			});

			const data = await response.json();
			
			if (!response.ok) {
				throw new Error(data.message || 'Bir hata oluştu');
			}

			result = data.data;
		
			// Add to conversation history
			if (result?.needsMoreInfo && result.questions) {
				conversationHistory.push({
					role: 'assistant',
					content: JSON.stringify(result.questions)
				});
				// Initialize followUpAnswers array with empty strings for new questions
				followUpAnswers = Array(result.questions.length).fill('');
			} else {
				// No more questions, clear the array
				followUpAnswers = [];
			}
		} catch (error: any) {
			alert(error.message || 'Bir hata oluştu');
			result = previousResult;
		} finally {
			loading = false;
		}
	}

	function resetForm() {
		city = "";
		amount = "";
		story = "";
		result = null;
		conversationHistory = [];
		followUpAnswers = [];
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8">
	<div class="container mx-auto px-4 max-w-4xl">
		<!-- Header -->
		<div class="mb-8">
			<Button href="/" variant="ghost" class="mb-4">
				<ArrowLeft class="w-4 h-4 mr-2" />
				Ana Sayfa
			</Button>
			<h1 class="text-3xl font-bold mb-2">Tüketici Başvurusu</h1>
			<p class="text-muted-foreground">
				Başınıza geleni kendi cümlelerinizle anlatın, size resmi başvuru metni hazırlayalım
			</p>
		</div>

		<!-- Form -->
		<Card.Root class="mb-8">
			<Card.Header>
				<Card.Title>Başvuru Bilgileri</Card.Title>
				<Card.Description>
					Lütfen aşağıdaki bilgileri eksiksiz doldurun
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-6">
				<div class="grid md:grid-cols-2 gap-6">
					<div class="space-y-2">
						<Label for="city">Şehir</Label>
						<Input
							id="city"
							placeholder="Örn: İstanbul"
							bind:value={city}
							disabled={loading}
						/>
					</div>
					<div class="space-y-2">
						<Label for="amount">Uyuşmazlık Bedeli (TL)</Label>
						<Input
							id="amount"
							type="number"
							placeholder="Örn: 5000"
							bind:value={amount}
							disabled={loading}
						/>
					</div>
				</div>
				
				<div class="space-y-2">
					<Label for="story">Başınıza Geleni Anlatın</Label>
					<Textarea
						id="story"
						placeholder="Olayı kendi cümlelerinizle, detaylı şekilde anlatın. Örneğin: Ne aldınız, ne zaman aldınız, ne problemi yaşadınız, şirkete ne söylediniz, ne dediler vs..."
						bind:value={story}
						rows={8}
						disabled={loading}
						class="resize-none"
					/>
					<p class="text-xs text-muted-foreground">
						Not: Fatura tarihi, servis raporları, garanti süresi gibi detayları ekleyin
					</p>
				</div>
			</Card.Content>
			<Card.Footer>
				<Button
					onclick={handleSubmit}
					disabled={loading || !city || !amount || !story}
					class="w-full"
					size="lg"
				>
					{#if loading}
						<Loader2 class="w-4 h-4 mr-2 animate-spin" />
						Analiz ediliyor...
					{:else}
						<Send class="w-4 h-4 mr-2" />
						Devam Et
					{/if}
				</Button>
			</Card.Footer>
		</Card.Root>

		<!-- Results -->
		{#if result}
			{#if result.needsMoreInfo && result.questions}
				<!-- Need More Info -->
				<Card.Root class="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
					<Card.Header>
						<Card.Title class="text-orange-900 dark:text-orange-100">
							Eksik Bilgiler
						</Card.Title>
						<Card.Description>
							Başvurunuzu daha iyi hazırlayabilmek için birkaç soruya yanıt verir misiniz?
						</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-4">
						{#each result.questions as question, i}
							<div class="space-y-2">
								<Label for="question-{i}" class="text-sm font-medium">
									<span class="text-orange-600 mr-1">•</span>
									{question}
								</Label>
								<Input
									id="question-{i}"
									placeholder="Yanıtınız..."
									bind:value={followUpAnswers[i]}
									disabled={loading}
									class="w-full"
									oninput={() => {
										// Ensure array size matches questions
										if (result && result.questions && followUpAnswers.length < result.questions.length) {
											followUpAnswers = [...followUpAnswers, ...Array(result.questions.length - followUpAnswers.length).fill('')];
										}
									}}
								/>
							</div>
						{/each}
					</Card.Content>
					<Card.Footer>
						<Button
							onclick={handleFollowUp}
							disabled={loading || followUpAnswers.some(a => !a?.trim())}
							class="w-full"
						>
							{#if loading}
								<Loader2 class="w-4 h-4 mr-2 animate-spin" />
								İşleniyor...
							{:else}
								<Send class="w-4 h-4 mr-2" />
								Yanıtla
							{/if}
						</Button>
					</Card.Footer>
				</Card.Root>
			{:else if result.analysis}
				<!-- Final Analysis -->
				<Card.Root class="border-green-200 bg-green-50 dark:bg-green-950/20">
					<Card.Header>
						<div class="flex items-center gap-2 mb-2">
							<FileText class="w-6 h-6 text-green-600" />
							<Card.Title class="text-green-900 dark:text-green-100">
								Başvuru Metniniz Hazır
							</Card.Title>
						</div>
						<Card.Description>
							Aşağıdaki metni inceleyip kopyalayabilir veya indirebilirsiniz
						</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-6">
						<!-- Resmi Başvuru Metni - Highlight -->
						<div class="space-y-2 p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-950/40 dark:to-emerald-950/40 rounded-lg border-2 border-green-300 dark:border-green-700">
							<div class="flex items-center justify-between mb-3">
								<h3 class="font-bold text-base text-green-900 dark:text-green-100">📄 RESMİ BAŞVURU METNİ</h3>
								<Button
									size="sm"
									variant="outline"
									onclick={() => {
										if (!result?.analysis) return;
										navigator.clipboard.writeText(result.analysis.resmiBasvuruMetni);
										alert('Resmi başvuru metni panoya kopyalandı! e-Devlet\'e yapıştırabilirsiniz.');
									}}
								>
									Kopyala
								</Button>
							</div>
							<div class="bg-white dark:bg-slate-900 p-4 rounded border border-green-200 dark:border-green-800">
								<p class="text-sm whitespace-pre-wrap leading-relaxed">
									{result.analysis.resmiBasvuruMetni}
								</p>
							</div>
							<p class="text-xs text-amber-700 dark:text-amber-300 mt-2 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800">
								⚠️ Bu bir test sistemidir. Gerçek başvurular için e-Devlet üzerinden resmi başvuru yapınız.
							</p>
						</div>

						<!-- Detaylı Analiz - Accordion -->
						<Accordion.Root class="w-full" type="single">
							<Accordion.Item value="details">
								<Accordion.Trigger class="text-sm font-medium">
									Detaylı Analizi Görüntüle
								</Accordion.Trigger>
								<Accordion.Content>
									<div class="space-y-4 pt-4">
										<div class="space-y-2">
											<h3 class="font-semibold text-sm text-muted-foreground">BAŞVURU ÖZETİ</h3>
											<p class="text-sm bg-white dark:bg-slate-900 p-4 rounded-lg border">
												{result.analysis.basvuruOzeti}
											</p>
										</div>
										
										<div class="space-y-2">
											<h3 class="font-semibold text-sm text-muted-foreground">OLAYLARIN GELİŞİMİ</h3>
											<p class="text-sm bg-white dark:bg-slate-900 p-4 rounded-lg border whitespace-pre-wrap">
												{result.analysis.olaylarinGelisimi}
											</p>
										</div>
										
										<div class="space-y-2">
											<h3 class="font-semibold text-sm text-muted-foreground">TALEBİM</h3>
											<p class="text-sm bg-white dark:bg-slate-900 p-4 rounded-lg border">
												{result.analysis.tuketiciTalebi}
											</p>
										</div>
										
										<div class="space-y-2">
											<h3 class="font-semibold text-sm text-muted-foreground">İLGİLİ MEVZUAT</h3>
											<div class="bg-white dark:bg-slate-900 p-4 rounded-lg border space-y-1">
												{#each result.analysis.uygulanacakMevzuat as madde}
													<p class="text-sm flex items-start gap-2">
														<span class="text-primary">⚖</span>
														<span>{madde}</span>
													</p>
												{/each}
											</div>
										</div>
										
										<div class="space-y-2">
											<h3 class="font-semibold text-sm text-muted-foreground">SONUÇ</h3>
											<p class="text-sm bg-white dark:bg-slate-900 p-4 rounded-lg border">
												{result.analysis.sonuc}
											</p>
										</div>
									</div>
								</Accordion.Content>
							</Accordion.Item>
						</Accordion.Root>
					</Card.Content>
					<Card.Footer class="flex gap-3">
						<Button
							onclick={() => {
								if (!result?.analysis) return;
								const text = `BAŞVURU ÖZETİ\n\n${result.analysis.basvuruOzeti}\n\nOLAYLARIN GELİŞİMİ\n\n${result.analysis.olaylarinGelisimi}\n\nTALEBİM\n\n${result.analysis.tuketiciTalebi}\n\nİLGİLİ MEVZUAT\n\n${result.analysis.uygulanacakMevzuat.join('\n')}\n\nSONUÇ\n\n${result.analysis.sonuc}`;
								navigator.clipboard.writeText(text);
								alert('Metin panoya kopyalandı');
							}}
							variant="outline"
							class="flex-1"
						>
							Kopyala
						</Button>
						<Button
							onclick={resetForm}
							class="flex-1"
						>
							Yeni Başvuru
						</Button>
					</Card.Footer>
				</Card.Root>
			{/if}
		{/if}
	</div>
</div>
