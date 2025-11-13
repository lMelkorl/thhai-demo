<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import * as Accordion from "$lib/components/ui/accordion";
	import { Textarea } from "$lib/components/ui/textarea";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { ArrowLeft, Send, Loader2, FileCheck } from "lucide-svelte";
	import type { AIResponse } from "$lib/types";

	let applicationText = $state("");
	let disputeSubject = $state("");
	let loading = $state(false);
	let result: AIResponse | null = $state(null);
	
	async function handleSubmit() {
		if (!applicationText || !disputeSubject) {
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
					userType: 'hakem',
					applicationText,
					disputeSubject
				})
			});

			const data = await response.json();
			
			if (!response.ok) {
				throw new Error(data.message || 'Bir hata oluştu');
			}

			result = data.data;
		} catch (error: any) {
			alert(error.message || 'Bir hata oluştu');
		} finally {
			loading = false;
		}
	}

	function resetForm() {
		applicationText = "";
		disputeSubject = "";
		result = null;
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
			<h1 class="text-3xl font-bold mb-2">Hakem Heyeti İncelemesi</h1>
			<p class="text-muted-foreground">
				Başvuru metnini analiz edin, tarafsız ön rapor alın
			</p>
		</div>

		<!-- Form -->
		<Card.Root class="mb-8">
			<Card.Header>
				<Card.Title>Başvuru Bilgileri</Card.Title>
				<Card.Description>
					İncelenecek başvuru bilgilerini girin
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-6">
				<div class="space-y-2">
					<Label for="dispute">Uyuşmazlık Konusu</Label>
					<Input
						id="dispute"
						placeholder="Örn: Cep telefonu onarım süresi aşımı"
						bind:value={disputeSubject}
						disabled={loading}
					/>
					<p class="text-xs text-muted-foreground">
						Uyuşmazlığın kısa özeti
					</p>
				</div>
				
				<div class="space-y-2">
					<Label for="application">Başvuru Metni</Label>
					<Textarea
						id="application"
						placeholder="Tüketicinin başvuru metnini buraya yapıştırın..."
						bind:value={applicationText}
						rows={12}
						disabled={loading}
						class="resize-none"
					/>
					<p class="text-xs text-muted-foreground">
						Başvuru metnini girin (Test amaçlı - Gerçek başvurular e-Devlet üzerinden yapılır)
					</p>
				</div>
			</Card.Content>
			<Card.Footer>
				<Button
					onclick={handleSubmit}
					disabled={loading || !applicationText || !disputeSubject}
					class="w-full"
					size="lg"
				>
					{#if loading}
						<Loader2 class="w-4 h-4 mr-2 animate-spin" />
						Analiz ediliyor...
					{:else}
						<Send class="w-4 h-4 mr-2" />
						Analiz Et
					{/if}
				</Button>
			</Card.Footer>
		</Card.Root>

		<!-- Results -->
		{#if result && result.analysis}
			<Card.Root class="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
				<Card.Header>
					<div class="flex items-center gap-2 mb-2">
						<FileCheck class="w-6 h-6 text-blue-600" />
						<Card.Title class="text-blue-900 dark:text-blue-100">
							Ön Analiz Raporu
						</Card.Title>
					</div>
					<Card.Description>
						Başvuru metni mevzuata göre analiz edilmiştir
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-6">
					<!-- Resmi Rapor - Highlight -->
					<div class="space-y-2 p-4 bg-gradient-to-r from-blue-100 to-sky-100 dark:from-blue-950/40 dark:to-sky-950/40 rounded-lg border-2 border-blue-300 dark:border-blue-700">
						<div class="flex items-center justify-between mb-3">
							<h3 class="font-bold text-base text-blue-900 dark:text-blue-100">📋 ÖN ANALİZ RAPORU</h3>
							<Button
								size="sm"
								variant="outline"
								onclick={() => {
									if (!result?.analysis) return;
									navigator.clipboard.writeText(result.analysis.resmiBasvuruMetni);
									alert('Ön analiz raporu panoya kopyalandı!');
								}}
							>
								Kopyala
							</Button>
						</div>
						<div class="bg-white dark:bg-slate-900 p-4 rounded border border-blue-200 dark:border-blue-800">
							<p class="text-sm whitespace-pre-wrap leading-relaxed">
								{result.analysis.resmiBasvuruMetni}
							</p>
						</div>
						<p class="text-xs text-blue-800 dark:text-blue-200 mt-2">
							⚖️ Bu rapor dosya değerlendirmesinde referans olarak kullanılabilir.
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
										<h3 class="font-semibold text-sm text-muted-foreground">OLAY ÖZETİ</h3>
										<p class="text-sm bg-white dark:bg-slate-900 p-4 rounded-lg border">
											{result.analysis.basvuruOzeti}
										</p>
									</div>
									
									<div class="space-y-2">
										<h3 class="font-semibold text-sm text-muted-foreground">OLAYLARIN GELİŞİMİ ve DETAYLAR</h3>
										<p class="text-sm bg-white dark:bg-slate-900 p-4 rounded-lg border whitespace-pre-wrap">
											{result.analysis.olaylarinGelisimi}
										</p>
									</div>
									
									<div class="space-y-2">
										<h3 class="font-semibold text-sm text-muted-foreground">TÜKETİCİNİN TALEBİ</h3>
										<p class="text-sm bg-white dark:bg-slate-900 p-4 rounded-lg border">
											{result.analysis.tuketiciTalebi}
										</p>
									</div>
									
									<div class="space-y-2">
										<h3 class="font-semibold text-sm text-muted-foreground">İLGİLİ MEVZUAT MADDELERİ</h3>
										<div class="bg-white dark:bg-slate-900 p-4 rounded-lg border space-y-2">
											{#each result.analysis.uygulanacakMevzuat as madde}
												<p class="text-sm flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
													<span class="text-primary font-bold">⚖</span>
													<span>{madde}</span>
												</p>
											{/each}
										</div>
									</div>
									
									<div class="space-y-2">
										<h3 class="font-semibold text-sm text-muted-foreground">ÖN DEĞERLENDİRME ve KANAAT</h3>
										<div class="bg-white dark:bg-slate-900 p-4 rounded-lg border">
											<p class="text-sm whitespace-pre-wrap">
												{result.analysis.sonuc}
											</p>
										</div>
									</div>
									
									<div class="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
										<p class="text-xs text-amber-900 dark:text-amber-100">
											<strong>Önemli Not:</strong> Bu rapor yalnızca ön analiz niteliğindedir ve kesin hüküm içermez. 
											Nihai karar Tüketici Hakem Heyeti tarafından verilecektir. Bu rapor, dosyanın değerlendirilmesinde 
											yardımcı bilgi sunmak amacıyla hazırlanmıştır.
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
							const text = `ÖN ANALİZ RAPORU\n\n` +
								`Uyuşmazlık Konusu: ${disputeSubject}\n\n` +
								`OLAY ÖZETİ\n\n${result.analysis.basvuruOzeti}\n\n` +
								`OLAYLARIN GELİŞİMİ\n\n${result.analysis.olaylarinGelisimi}\n\n` +
								`TÜKETİCİNİN TALEBİ\n\n${result.analysis.tuketiciTalebi}\n\n` +
								`İLGİLİ MEVZUAT\n\n${result.analysis.uygulanacakMevzuat.join('\n\n')}\n\n` +
								`ÖN DEĞERLENDİRME\n\n${result.analysis.sonuc}\n\n` +
								`Not: Bu rapor yalnızca ön analiz niteliğindedir ve kesin hüküm içermez.`;
							navigator.clipboard.writeText(text);
							alert('Rapor panoya kopyalandı');
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
						Yeni İnceleme
					</Button>
				</Card.Footer>
			</Card.Root>
		{/if}
	</div>
</div>
