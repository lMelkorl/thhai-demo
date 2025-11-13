<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { ArrowLeft, Send, Loader2, Copy, Bot, User } from "lucide-svelte";
	import type { AIResponse, Message } from "$lib/types";
	import { onMount } from "svelte";

	type ChatMessage = {
		role: 'user' | 'assistant' | 'system';
		content: string;
		timestamp: Date;
		isTyping?: boolean;
	};

	let chatMessages = $state<ChatMessage[]>([]);
	let userInput = $state("");
	let loading = $state(false);
	let conversationHistory: Message[] = $state([]);
	let result: AIResponse | null = $state(null);
	let chatContainer: HTMLDivElement;
	
	// Initial state
	let city = $state("");
	let amount = $state("");
	let step = $state<'welcome' | 'city' | 'amount' | 'story' | 'questions' | 'done'>('welcome');
	let storyText = $state("");
	let currentQuestions = $state<string[]>([]);
	let currentQuestionIndex = $state(0);

	onMount(() => {
		// Welcome message
		setTimeout(() => {
			addAssistantMessage("Merhaba! 👋 Ben THH-AI, size Tüketici Hakem Heyeti başvurunuzu hazırlamada yardımcı olacağım.");
			setTimeout(() => {
				addAssistantMessage("Başlamak için önce hangi şehirde yaşadığınızı öğrenmem gerekiyor. Şehriniz neresi?");
				step = 'city';
			}, 800);
		}, 300);
	});

	function addAssistantMessage(content: string, isTyping = false) {
		chatMessages.push({
			role: 'assistant',
			content,
			timestamp: new Date(),
			isTyping
		});
		scrollToBottom();
	}

	function addUserMessage(content: string) {
		chatMessages.push({
			role: 'user',
			content,
			timestamp: new Date()
		});
		scrollToBottom();
	}

	function addSystemMessage(content: string) {
		chatMessages.push({
			role: 'system',
			content,
			timestamp: new Date()
		});
		scrollToBottom();
	}

	function scrollToBottom() {
		if (chatContainer) {
			requestAnimationFrame(() => {
				chatContainer.scrollTo({
					top: chatContainer.scrollHeight,
					behavior: 'smooth'
				});
			});
		}
	}

	async function handleSend() {
		if (!userInput.trim() || loading) return;

		const message = userInput.trim();
		addUserMessage(message);
		userInput = "";

		if (step === 'city') {
			city = message;
			setTimeout(() => {
				addAssistantMessage(`Anlıyorum, ${city} şehrindesiniz. 📍`);
				setTimeout(() => {
					addAssistantMessage("Şimdi de uyuşmazlık bedelini öğrenmem gerekiyor. Kaç TL'lik bir uyuşmazlık söz konusu?");
					step = 'amount';
				}, 600);
			}, 400);
		} else if (step === 'amount') {
			amount = message;
			setTimeout(() => {
				addAssistantMessage(`Uyuşmazlık bedeli: ${amount} TL olarak kaydettim. 💰`);
				setTimeout(() => {
					addAssistantMessage("Artık asıl konuya gelelim. Başınıza geleni detaylı bir şekilde anlatır mısınız? Ne aldınız, ne zaman aldınız, ne problemi yaşadınız?");
					step = 'story';
				}, 600);
			}, 400);
		} else if (step === 'story') {
			storyText = message;
			await analyzeStory();
		} else if (step === 'questions' && currentQuestions.length > 0) {
			// Handle question answers
			conversationHistory.push({
				role: 'user',
				content: message
			});
			
			if (currentQuestionIndex < currentQuestions.length - 1) {
				// More questions to ask
				currentQuestionIndex++;
				setTimeout(() => {
					addAssistantMessage(currentQuestions[currentQuestionIndex]);
				}, 400);
			} else {
				// All questions answered, analyze again
				await analyzeWithFollowUp();
			}
		}
	}

	async function analyzeStory() {
		loading = true;
		addSystemMessage("🔍 Hikayenizi analiz ediyorum...");

		try {
			conversationHistory.push({
				role: 'user',
				content: storyText
			});

			const response = await fetch('/api/analyze', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userType: 'tuketici',
					city,
					amount: parseFloat(amount),
					story: storyText,
					conversationHistory
				})
			});

			const data = await response.json();
			if (!response.ok) throw new Error(data.message || 'Bir hata oluştu');

			result = data.data;

			setTimeout(() => {
				if (result?.needsMoreInfo && result?.questions) {
					conversationHistory.push({
						role: 'assistant',
						content: JSON.stringify(result.questions)
					});
					
					addAssistantMessage("Anladım. Başvurunuzu daha iyi hazırlayabilmek için birkaç ek bilgiye ihtiyacım var. 🤔");
					setTimeout(() => {
						if (result?.questions) {
							currentQuestions = result.questions;
							currentQuestionIndex = 0;
							step = 'questions';
							addAssistantMessage(currentQuestions[0]);
						}
					}, 600);
				} else if (result?.analysis) {
					showFinalResult();
				}
			}, 800);
		} catch (error: any) {
			addSystemMessage(`❌ Hata: ${error.message}`);
		} finally {
			loading = false;
		}
	}

	async function analyzeWithFollowUp() {
		loading = true;
		addSystemMessage("🔍 Bilgilerinizi işliyorum...");

		try {
			const response = await fetch('/api/analyze', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userType: 'tuketici',
					city,
					amount: parseFloat(amount),
					story: conversationHistory[conversationHistory.length - 1].content,
					conversationHistory
				})
			});

			const data = await response.json();
			if (!response.ok) throw new Error(data.message || 'Bir hata oluştu');

			result = data.data;

			setTimeout(() => {
				if (result?.needsMoreInfo && result?.questions) {
					conversationHistory.push({
						role: 'assistant',
						content: JSON.stringify(result.questions)
					});
					
					addAssistantMessage("Hala birkaç detay daha lazım. 🧐");
					setTimeout(() => {
						if (result?.questions) {
							currentQuestions = result.questions;
							currentQuestionIndex = 0;
							addAssistantMessage(currentQuestions[0]);
						}
					}, 500);
				} else if (result?.analysis) {
					showFinalResult();
				}
			}, 800);
		} catch (error: any) {
			addSystemMessage(`❌ Hata: ${error.message}`);
		} finally {
			loading = false;
		}
	}

	function showFinalResult() {
		step = 'done';
		setTimeout(() => {
			addAssistantMessage("Harika! Tüm bilgileri topladım. 🎉");
			setTimeout(() => {
				addAssistantMessage("Başvuru metniniz hazır! Aşağıda görebilirsiniz:");
			}, 500);
		}, 400);
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		addSystemMessage("✅ Panoya kopyalandı!");
	}

	function resetChat() {
		chatMessages = [];
		conversationHistory = [];
		result = null;
		city = "";
		amount = "";
		storyText = "";
		currentQuestions = [];
		currentQuestionIndex = 0;
		step = 'welcome';
		// Re-initialize welcome message
		setTimeout(() => {
			addAssistantMessage("Merhaba! 👋 Ben THH-AI, size Tüketici Hakem Heyeti başvurunuzu hazırlamada yardımcı olacağım.");
			setTimeout(() => {
				addAssistantMessage("Başlamak için önce hangi şehirde yaşadığınızı öğrenmem gerekiyor. Şehriniz neresi?");
				step = 'city';
			}, 800);
		}, 300);
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
	<div class="container mx-auto px-4 max-w-5xl h-screen flex flex-col py-4">
		<!-- Header -->
		<div class="mb-4">
			<Button href="/" variant="ghost" size="sm">
				<ArrowLeft class="w-4 h-4 mr-2" />
				Ana Sayfa
			</Button>
		</div>

		<!-- Chat Container -->
		<div class="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
			<!-- Chat Header -->
			<div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center gap-3">
				<div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
					<Bot class="w-6 h-6" />
				</div>
				<div>
					<h2 class="font-bold">THH-AI Asistan</h2>
					<p class="text-xs text-white/80">
						{#if loading}
							Yazıyor...
						{:else}
							Online
						{/if}
					</p>
				</div>
			</div>

			<!-- Messages -->
			<div bind:this={chatContainer} class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950 scroll-smooth">
				{#each chatMessages as message}
					<div class="animate-in fade-in duration-200">
						{#if message.role === 'assistant'}
							<div class="flex gap-3 items-start">
								<div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
									<Bot class="w-5 h-5 text-white" />
								</div>
								<div class="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%] shadow-sm border border-slate-200 dark:border-slate-700">
									<p class="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
									<p class="text-xs text-slate-400 mt-1">
										{message.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
									</p>
								</div>
							</div>
						{:else if message.role === 'user'}
							<div class="flex gap-3 items-start justify-end">
								<div class="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%] shadow-sm">
									<p class="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
									<p class="text-xs text-white/60 mt-1 text-right">
										{message.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
									</p>
								</div>
								<div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
									<User class="w-5 h-5 text-white" />
								</div>
							</div>
						{:else}
							<div class="flex justify-center">
								<div class="bg-slate-200 dark:bg-slate-800 rounded-full px-4 py-2 text-xs text-slate-600 dark:text-slate-400">
									{message.content}
								</div>
							</div>
						{/if}
					</div>
				{/each}

				{#if loading}
					<div class="flex gap-3 items-start">
						<div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
							<Bot class="w-5 h-5 text-white" />
						</div>
						<div class="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-slate-200 dark:border-slate-700">
							<div class="flex gap-1.5">
								<div class="typing-dot"></div>
								<div class="typing-dot" style="animation-delay: 0.2s"></div>
								<div class="typing-dot" style="animation-delay: 0.4s"></div>
							</div>
						</div>
					</div>
				{/if}

				<!-- Final Result -->
				{#if result?.analysis && step === 'done'}
					<div class="space-y-4 mt-4">
						<div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl p-6 border-2 border-green-300 dark:border-green-700 shadow-lg">
							<div class="flex items-center justify-between mb-4">
								<h3 class="font-bold text-lg text-green-900 dark:text-green-100 flex items-center gap-2">
									<span class="text-2xl">📄</span>
									Resmi Başvuru Metni
								</h3>
								<Button
									size="sm"
									variant="outline"
									onclick={() => {
										if (result?.analysis?.resmiBasvuruMetni) {
											copyToClipboard(result.analysis.resmiBasvuruMetni);
										}
									}}
								>
									<Copy class="w-4 h-4 mr-1" />
									Kopyala
								</Button>
							</div>
							<div class="bg-white dark:bg-slate-900 rounded-xl p-4 border border-green-200 dark:border-green-800">
								<p class="text-sm leading-relaxed whitespace-pre-wrap">
									{result.analysis.resmiBasvuruMetni}
								</p>
							</div>
							<p class="text-xs text-amber-700 dark:text-amber-300 mt-3 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800">
								⚠️ Bu bir test sistemidir. Gerçek başvurular için e-Devlet üzerinden resmi başvuru yapınız.
							</p>
						</div>

						<div class="flex gap-2">
							<Button onclick={resetChat} class="flex-1" variant="outline">
								Yeni Başvuru
							</Button>
							<Button
								onclick={() => {
									if (!result?.analysis) return;
									const text = `${result.analysis.basvuruOzeti}\n\n${result.analysis.olaylarinGelisimi}\n\n${result.analysis.tuketiciTalebi}\n\n${result.analysis.uygulanacakMevzuat.join('\n')}\n\n${result.analysis.sonuc}`;
									copyToClipboard(text);
								}}
								class="flex-1"
							>
								<Copy class="w-4 h-4 mr-2" />
								Tümünü Kopyala
							</Button>
						</div>
					</div>
				{/if}
			</div>

			<!-- Input Area -->
			{#if step !== 'done'}
				<div class="p-4 mb-10 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
					<form
						onsubmit={(e) => {
							e.preventDefault();
							handleSend();
						}}
						class="flex gap-2"
					>
						<Input
							bind:value={userInput}
							placeholder="Mesajınızı yazın..."
							disabled={loading || step === 'welcome'}
							class="flex-1"
							autofocus
						/>
						<Button
							type="submit"
							disabled={!userInput.trim() || loading || step === 'welcome'}
							size="icon"
							class="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
						>
							{#if loading}
								<Loader2 class="w-6 h-6 animate-spin" />
							{:else}
								<Send class="w-6 h-6" />
							{/if}
						</Button>
					</form>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	/* Optimize animations with will-change and transform */
	.animate-in {
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Smooth typing indicator */
	.typing-dot {
		width: 8px;
		height: 8px;
		background-color: rgb(148 163 184);
		border-radius: 50%;
		animation: typingBounce 1.4s infinite ease-in-out;
		will-change: transform;
	}

	@keyframes typingBounce {
		0%, 60%, 100% {
			transform: translateY(0);
		}
		30% {
			transform: translateY(-10px);
		}
	}

	/* Optimize scroll performance */
	.scroll-smooth {
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
	}

	/* GPU acceleration for animations */
	.bg-gradient-to-br,
	.bg-gradient-to-r {
		transform: translateZ(0);
		backface-visibility: hidden;
	}
</style>
