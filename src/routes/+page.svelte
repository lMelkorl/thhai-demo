<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import { Scale, Users, MessageCircle, FileText } from "lucide-svelte";
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
	<div class="container mx-auto px-4 py-16">
		<!-- Header -->
		<div class="text-center mb-12">
			<div class="inline-block mb-6 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-full border border-amber-300 dark:border-amber-700">
				<p class="text-xs font-semibold text-amber-800 dark:text-amber-200">
					⚠️ DEMO / TEST SİSTEMİ
				</p>
			</div>
			<div class="flex items-center justify-center gap-3 mb-6">
				<Scale class="w-12 h-12 text-primary" />
				<h1 class="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
					THH-AI
				</h1>
			</div>
			<p class="text-2xl font-semibold text-slate-800 dark:text-slate-100 max-w-2xl mx-auto mb-3">
				Tüketici Hakem Heyeti Yapay Zeka Asistanı
			</p>
			<p class="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
				Tüketici başvurusu hazırlama ve hakem heyeti analizi için AI destekli demo platform
			</p>
		</div>

		<!-- Cards -->
		<div class="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
			<!-- Tüketici Card -->
			<Card.Root class="hover:shadow-xl transition-all hover:scale-[1.02] border-2">
				<Card.Header>
					<div class="flex items-center gap-3 mb-2">
						<div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
							<Users class="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
						</div>
						<Card.Title class="text-2xl">Tüketici Başvuru</Card.Title>
					</div>
					<Card.Description class="text-base">
						AI ile interaktif sohbet ederek başvuru metni oluşturun
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<ul class="space-y-3 text-sm text-slate-700 dark:text-slate-300">
						<li class="flex items-start gap-2">
							<span class="text-indigo-600 dark:text-indigo-400 mt-0.5">✓</span>
							<span>Olayı kendi cümlelerinizle anlatın</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-indigo-600 dark:text-indigo-400 mt-0.5">✓</span>
							<span>AI eksik bilgileri adım adım sorar</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-indigo-600 dark:text-indigo-400 mt-0.5">✓</span>
							<span>Mevzuata uygun resmi metin hazırlanır</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-indigo-600 dark:text-indigo-400 mt-0.5">✓</span>
							<span>İlgili kanun maddeleri gösterilir</span>
						</li>
					</ul>
				</Card.Content>
				<Card.Footer class="flex gap-3">
					<Button href="/tuketici-chat" class="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" size="lg">
						<MessageCircle class="w-4 h-4 mr-2" />
						Chat (Yeni!)
					</Button>
					<Button href="/tuketici" variant="outline" class="flex-1" size="lg">
						<FileText class="w-4 h-4 mr-2" />
						Form
					</Button>
				</Card.Footer>
			</Card.Root>

			<!-- Hakem Heyeti Card -->
			<Card.Root class="hover:shadow-xl transition-all hover:scale-[1.02] border-2">
				<Card.Header>
					<div class="flex items-center gap-3 mb-2">
						<div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
							<Scale class="w-6 h-6 text-purple-600 dark:text-purple-400" />
						</div>
						<Card.Title class="text-2xl">Hakem Heyeti Analiz</Card.Title>
					</div>
					<Card.Description class="text-base">
						Başvuru metinlerini analiz edip ön değerlendirme raporu alın
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<ul class="space-y-3 text-sm text-slate-700 dark:text-slate-300">
						<li class="flex items-start gap-2">
							<span class="text-purple-600 dark:text-purple-400 mt-0.5">✓</span>
							<span>Başvuru metni ve uyuşmazlık konusu girin</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-purple-600 dark:text-purple-400 mt-0.5">✓</span>
							<span>İlgili mevzuat maddeleri listelenir</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-purple-600 dark:text-purple-400 mt-0.5">✓</span>
							<span>Tarafsız hukuki değerlendirme</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-purple-600 dark:text-purple-400 mt-0.5">✓</span>
							<span>Ön analiz raporu oluşturulur</span>
						</li>
					</ul>
				</Card.Content>
				<Card.Footer>
					<Button href="/hakem" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white" size="lg">
						Analiz Yap
					</Button>
				</Card.Footer>
			</Card.Root>
		</div>

		<!-- Footer Info -->
		<div class="mt-20 space-y-6">
			<div class="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-2 border-amber-300 dark:border-amber-700 rounded-2xl p-6 max-w-4xl mx-auto shadow-lg">
				<div class="flex items-start gap-4">
					<div class="flex-shrink-0 w-12 h-12 bg-amber-200 dark:bg-amber-800 rounded-full flex items-center justify-center text-2xl">
						⚠️
					</div>
					<div class="flex-1">
						<h3 class="text-lg font-bold text-amber-900 dark:text-amber-100 mb-2">
							Demo / Test Sistemi
						</h3>
						<p class="text-sm text-amber-800 dark:text-amber-200 leading-relaxed mb-3">
							Bu platform eğitim ve test amaçlıdır. Gerçek hukuki başvurularınız için 
							<strong>e-Devlet</strong> üzerinden resmi <strong>Tüketici Hakem Heyeti</strong> 
							başvuru sistemini kullanmanız gerekmektedir.
						</p>
						<div class="flex flex-wrap gap-2">
							<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
								📚 Eğitim Amaçlı
							</span>
							<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
								🧪 Test Ortamı
							</span>
							<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
								🤖 AI Destekli
							</span>
						</div>
					</div>
				</div>
			</div>
			
			<div class="max-w-4xl mx-auto grid md:grid-cols-3 gap-4 text-center">
				<div class="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
					<p class="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Hukuki Rehberlik</p>
					<p class="text-xs text-slate-500 dark:text-slate-400">Mevzuata göre analiz ve öneri</p>
				</div>
				<div class="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
					<p class="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tarafsız Değerlendirme</p>
					<p class="text-xs text-slate-500 dark:text-slate-400">Objektif AI analizi</p>
				</div>
				<div class="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
					<p class="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Resmi Değil</p>
					<p class="text-xs text-slate-500 dark:text-slate-400">Bağlayıcı karar vermez</p>
				</div>
			</div>
		</div>
	</div>
</div>
