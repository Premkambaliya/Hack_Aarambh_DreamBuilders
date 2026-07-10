import { createElement, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	CheckCircle,
	ChevronRight,
	Cpu,
	FileAudio,
	FileText,
	Info,
	Loader2,
	Mic,
	Sparkles,
	Type,
	Upload,
	X,
	Zap,
} from 'lucide-react';
import { productsApi } from '../api/api';

const PIPELINE_STEPS = [
	{ key: 'uploading', label: 'Uploading file', description: 'Saving to server', color: '#6C63FF' },
	{ key: 'transcribing', label: 'Transcribing with Groq Whisper', description: 'Speech to Text', color: '#00D4AA' },
	{ key: 'analyzing', label: 'Analyzing with LLaMA-3.3-70b', description: 'GPT intelligence', color: '#F59E0B' },
	{ key: 'done', label: 'Insights ready!', description: 'Redirecting…', color: '#10B981' },
];

const DETECTION_ITEMS = [
	{ icon: '🎙️', label: 'Full Transcript', description: 'Groq Whisper speech-to-text', color: '#6C63FF' },
	{ icon: '📝', label: 'Call Summary', description: 'Detailed 3-5 sentence overview', color: '#00D4AA' },
	{ icon: '✅', label: 'Buying Signals', description: 'Positive purchase intent indicators', color: '#10B981' },
	{ icon: '⚠️', label: 'Objections', description: 'Pricing, timing, feature concerns', color: '#F59E0B' },
	{ icon: '😊', label: 'Sentiment Analysis', description: 'Positive, Neutral, or Negative', color: '#EC4899' },
	{ icon: '📊', label: 'Deal Probability', description: '0-100% close likelihood score', color: '#8B5CF6' },
	{ icon: '📧', label: 'Follow-Up Action', description: 'AI-suggested next steps', color: '#06B6D4' },
	{ icon: '⭐', label: 'Salesperson Rating', description: '1-10 score with skill breakdowns', color: '#F97316' },
	{ icon: '🎯', label: 'Missed Opportunities', description: 'Moments the rep could have leveraged', color: '#EF4444' },
	{ icon: '🏁', label: 'Competitor Mentions', description: 'Alternative products discussed', color: '#84CC16' },
	{ icon: '💡', label: 'Coaching Tips', description: 'Actionable tips to boost performance', color: '#A78BFA' },
	{ icon: '🔥', label: 'Pain Points', description: 'Customer frustrations and needs', color: '#FB923C' },
];

const PIPELINE_ITEMS = [
	'Audio uploaded to server',
	'Groq Whisper transcribes speech to text',
	'LLaMA-3.3-70b deep-analyzes conversation',
	'Signals, objections & sentiment detected',
	'Salesperson tone, EQ & performance scored',
	'11 skill scores + 5 call phase scores generated',
	'Talk ratio, questions & engagement analyzed',
	'Pain points, key topics & pricing extracted',
	'Objection responses rated for effectiveness',
	'Key moments & missed opportunities identified',
	'Deal probability & urgency calculated',
	'Follow-up email & action items generated',
	'Results saved to MongoDB Atlas',
];

const ACCEPTED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.ogg', '.webm', '.flac', '.aac', '.mp4'];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const formatFileSize = (size) => `${(size / (1024 * 1024)).toFixed(2)} MB`;

const isAcceptedFile = (file) => {
	const fileName = file.name.toLowerCase();
	return ACCEPTED_EXTENSIONS.some((extension) => fileName.endsWith(extension));
};

function AnalyzeCall({ token }) {
	const fileInputRef = useRef(null);
	const [inputType, setInputType] = useState('audio');
	const [audioFile, setAudioFile] = useState(null);
	const [textContent, setTextContent] = useState('');
	const [step, setStep] = useState(null);
	const [completedSteps, setCompletedSteps] = useState([]);
	const [customerName, setCustomerName] = useState('');
	const [customerEmail, setCustomerEmail] = useState('');
	const [customerPhone, setCustomerPhone] = useState('');
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isDragActive, setIsDragActive] = useState(false);
	const [feedback, setFeedback] = useState(null);
	// product selection
	const [products, setProducts] = useState([]);
	const [productId, setProductId] = useState('');
	const navigate = useNavigate();

	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

	useEffect(() => {
		const loadProducts = async () => {
			try {
				const response = await productsApi.getProducts(token);
				if (response.products?.length > 0) {
					setProducts(response.products);
					setProductId(''); // Default to auto-detect
				}
			} catch (err) {
				console.error("Could not load products", err);
			}
		};
		loadProducts();
	}, [token]);

	const setSelectedFile = useCallback((file) => {
		if (!file) return;
		if (file.size > MAX_FILE_SIZE) {
			setFeedback({ type: 'error', message: 'File too large. Maximum size is 50MB.' });
			return;
		}
		if (!isAcceptedFile(file)) {
			setFeedback({ type: 'error', message: 'Invalid format. Use mp3, wav, m4a, ogg, webm, flac, aac, or mp4.' });
			return;
		}
		setFeedback(null);
		setAudioFile(file);
	}, []);

	const resetPipeline = useCallback(() => {
		setStep(null);
		setCompletedSteps([]);
		setUploadProgress(0);
	}, []);

	const handleFileInputChange = useCallback((event) => {
		const [file] = event.target.files || [];
		setSelectedFile(file);
	}, [setSelectedFile]);

	const handleDrop = useCallback((event) => {
		event.preventDefault();
		setIsDragActive(false);
		const [file] = Array.from(event.dataTransfer.files || []);
		setSelectedFile(file);
	}, [setSelectedFile]);

	const uploadAudio = async () => {
		const formData = new FormData();
		formData.append('audio', audioFile);
		formData.append('customer_name', customerName || 'Unknown');
		formData.append('customer_email', customerEmail);
		formData.append('customer_phone', customerPhone || '');
		formData.append('productId', productId || '');
		const response = await fetch(`${API_BASE_URL}/audio/upload`, {
			method: 'POST',
			headers: { 'Authorization': `Bearer ${token}` },
			body: formData,
		});
		const data = await response.json();
		if (!response.ok) throw new Error(data.message || 'Upload failed');
		return data.callId;
	};

	const transcribeAudio = async (cId) => {
		const response = await fetch(`${API_BASE_URL}/transcription/transcribe/${cId}`, {
			method: 'POST',
			headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
		});
		const data = await response.json();
		if (!response.ok) throw new Error(data.message || 'Transcription failed');
		return data.transcript;
	};

	const analyzeCall = async (cId) => {
		const response = await fetch(`${API_BASE_URL}/ai/analyze/${cId}`, {
			method: 'POST',
			headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
		});
		const data = await response.json();
		if (!response.ok) throw new Error(data.message || 'Analysis failed');
		return data.insights;
	};

	const uploadText = async () => {
		const response = await fetch(`${API_BASE_URL}/audio/upload-text`, {
			method: 'POST',
			headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
			body: JSON.stringify({
				text: textContent,
				customer_name: customerName || 'Unknown',
				customer_email: customerEmail,
				customer_phone: customerPhone || '',
				productId: productId || ''
			}),
		});
		const data = await response.json();
		if (!response.ok) throw new Error(data.message || 'Upload failed');
		return data.callId;
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setFeedback(null);
		if (inputType === 'audio' && !audioFile) {
			setFeedback({ type: 'error', message: 'Please select an audio or video file first.' });
			return;
		}
		if (inputType === 'text' && !textContent.trim()) {
			setFeedback({ type: 'error', message: 'Please enter the text format speech.' });
			return;
		}
		if (!customerEmail) {
			setFeedback({ type: 'error', message: 'Please enter customer email.' });
			return;
		}
		resetPipeline();
		setStep('uploading');
		try {
			let cId;
			if (inputType === 'audio') {
				cId = await uploadAudio();
			} else {
				cId = await uploadText();
			}
			setCompletedSteps(['uploading']);
			if (inputType === 'audio') {
				setStep('transcribing');
				await transcribeAudio(cId);
				setCompletedSteps(['uploading', 'transcribing']);
			}
			setStep('analyzing');
			await analyzeCall(cId);
			setCompletedSteps(['uploading', 'transcribing', 'analyzing', 'done']);
			setStep('done');
			setTimeout(() => navigate(`/dashboard/calls/${cId}`), 600);
		} catch (error) {
			resetPipeline();
			setFeedback({ type: 'error', message: error.message });
		}
	};

	/* ─── Pipeline / Loading screen ─── */
	if (step) {
		const progress = step === 'done' ? 100 : Math.round(((completedSteps.length) / (PIPELINE_STEPS.length - 1)) * 100);

		return (
			<div className="flex min-h-[80vh] flex-col items-center justify-center py-10 text-center animate-in fade-in duration-300">
				{/* Glow orb */}
				<div className="relative mb-8">
					<div className={`h-28 w-28 rounded-full flex items-center justify-center ${step === 'done' ? 'bg-emerald-500/10' : 'bg-orange-500/10'} shadow-[0_0_60px_rgba(108,99,255,0.2)]`}>
						{step === 'done' ? (
							<CheckCircle size={60} className="text-emerald-400" />
						) : (
							<Loader2 size={60} className="animate-spin text-orange-500" />
						)}
					</div>
					<div className="pointer-events-none absolute inset-0 rounded-full blur-2xl opacity-30" style={{ background: 'radial-gradient(circle, #6C63FF, transparent)' }} />
				</div>

				<h2 className="bg-gradient-to-r from-orange-600 via-cyan-300 to-emerald-300 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
					{step === 'done' ? 'Analysis Complete!' : 'AI Pipeline Running…'}
				</h2>
				<p className="mt-3 max-w-sm text-sm text-gray-500">
					{step === 'uploading' && inputType === 'audio'
						? `Uploading: ${uploadProgress}%`
						: step === 'done'
							? 'Redirecting you to your insights…'
							: 'Please wait — LLMs are working their magic.'}
				</p>

				{/* Progress bar */}
				<div className="mt-6 w-full max-w-sm">
					<div className="mb-1.5 flex justify-between text-xs text-gray-400">
						<span>Progress</span>
						<span>{progress}%</span>
					</div>
					<div className="h-2 overflow-hidden rounded-full bg-gray-100">
						<div
							className="h-full rounded-full bg-gradient-to-r from-orange-500 via-cyan-400 to-emerald-400 transition-all duration-700"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>

				{/* Steps */}
				<div className="mt-8 flex w-full max-w-sm flex-col gap-3">
					{PIPELINE_STEPS.map((ps, idx) => {
						const isDone = completedSteps.includes(ps.key);
						const isCurrent = step === ps.key && !isDone;
						return (
							<div
								key={ps.key}
								className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 ${
									isDone
										? 'border-emerald-500/25 bg-emerald-500/10'
										: isCurrent
											? 'border-orange-500/35 bg-orange-500/10 shadow-[0_0_24px_rgba(108,99,255,0.12)]'
											: 'border-gray-100 bg-gray-50 opacity-50'
								}`}
							>
								<div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
									isDone ? 'bg-emerald-500/20 text-emerald-400' : isCurrent ? 'bg-orange-500/20 text-orange-500' : 'bg-gray-100 text-gray-400'
								}`}>
									{isDone ? (
										<CheckCircle size={16} />
									) : isCurrent ? (
										<Loader2 size={15} className="animate-spin" />
									) : (
										idx + 1
									)}
								</div>
								<div className="flex-1">
									<span className={`block text-sm font-semibold ${isDone ? 'text-emerald-300' : isCurrent ? 'text-orange-700' : 'text-gray-500'}`}>
										{ps.label}
									</span>
									<span className="block text-xs opacity-60 text-gray-500">{ps.description}</span>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		);
	}

	/* ─── Main form ─── */
	const canSubmit = inputType === 'audio' ? !!audioFile : !!textContent.trim();

	return (
		<div className="py-8 text-gray-700 animate-in fade-in duration-300">

			{/* ── Header ── */}
			<div className="mb-8">
				<div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-3.5 py-1.5 text-xs font-semibold text-orange-600">
					<Sparkles size={12} />
					Powered by Groq Whisper + LLaMA-3.3-70b
				</div>
				<h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
					Conversation Analysis Studio
				</h1>
				<p className="mt-2 max-w-2xl text-sm text-gray-500 md:text-base">
					Upload recordings or paste transcripts to generate structured call intelligence, rep coaching feedback, and next-step recommendations.
				</p>
			</div>

			{/* ── Input type tabs ── */}
			<div className="mb-6 inline-flex gap-1 rounded-2xl border border-gray-200 bg-[#f8f9fa] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
				{[
					{ key: 'audio', icon: FileAudio, label: 'Audio / Video Upload' },
					{ key: 'text', icon: Type, label: 'Paste Text Transcript' },
				].map(({ key, icon: TabIcon, label }) => (
					<button
						key={key}
						type="button"
						onClick={() => setInputType(key)}
						className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
							inputType === key
								? 'bg-gradient-to-r from-orange-500 to-orange-500 text-gray-900 shadow-[0_8px_24px_rgba(108,99,255,0.35)]'
								: 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
						}`}
					>
						{createElement(TabIcon, { size: 15 })}
						{label}
					</button>
				))}
			</div>

			{/* ── Error / success feedback ── */}
			{feedback && (
				<div className={`mb-6 flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm ${
					feedback.type === 'error'
						? 'border-rose-500/25 bg-rose-500/10 text-rose-300'
						: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
				}`}>
					<X size={15} className="shrink-0" />
					{feedback.message}
				</div>
			)}

			<div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
				{/* ── Left: Form ── */}
				<form className="flex flex-col gap-5" onSubmit={handleSubmit}>

					{/* Customer details */}
					<section className="rounded-2xl border border-gray-200 bg-[#ffffff]/90 p-6 shadow-[0_16px_50px_rgba(0,0,0,0.25)] backdrop-blur-md">
						<div className="mb-5 flex items-center gap-2.5">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/15 text-orange-500">
								<Mic size={15} />
							</div>
							<h3 className="text-base font-bold text-gray-900">Customer Details</h3>
						</div>
						<div className="grid gap-3.5">
							{[
								{ placeholder: 'Customer Name', value: customerName, onChange: setCustomerName, type: 'text' },
								{ placeholder: 'Customer Email *', value: customerEmail, onChange: setCustomerEmail, type: 'email', required: true },
								{ placeholder: 'Customer Phone (optional)', value: customerPhone, onChange: setCustomerPhone, type: 'tel' },
							].map(({ placeholder, value, onChange, type, required }) => (
								<input
									key={placeholder}
									type={type}
									placeholder={placeholder}
									value={value}
									onChange={(e) => onChange(e.target.value)}
									required={required}
									className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500/60 focus:bg-gray-100 focus:ring-2 focus:ring-orange-500/15"
								/>
							))}

							{products.length > 0 && (
								<div className="relative">
									<select
										value={productId}
										onChange={(e) => setProductId(e.target.value)}
										className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-900 outline-none transition focus:border-orange-500/60 focus:bg-gray-100 focus:ring-2 focus:ring-orange-500/15"
									>
										<option value="" className="bg-[#ffffff] text-gray-900">✨ Auto-detect Product using AI</option>
										{products.map(p => (
											<option key={p._id} value={p._id} className="bg-[#ffffff] text-gray-900">
												{p.productName}
											</option>
										))}
									</select>
									<div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
										<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
									</div>
								</div>
							)}
						</div>
					</section>

					{/* Upload / text area */}
					<section className="rounded-2xl border border-gray-200 bg-[#ffffff]/90 p-6 shadow-[0_16px_50px_rgba(0,0,0,0.25)] backdrop-blur-md">
						{inputType === 'audio' ? (
							<>
								<div className="mb-5 flex items-center gap-2.5">
									<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400">
										<FileAudio size={15} />
									</div>
									<h3 className="text-base font-bold text-gray-900">Audio / Video Upload</h3>
								</div>

								{!audioFile ? (
									<div
										role="button"
										tabIndex={0}
										onClick={() => fileInputRef.current?.click()}
										onKeyDown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); }
										}}
										onDragEnter={(e) => { e.preventDefault(); setIsDragActive(true); }}
										onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
										onDragLeave={(e) => { e.preventDefault(); setIsDragActive(false); }}
										onDrop={handleDrop}
										className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all duration-200 ${
											isDragActive
												? 'border-orange-500 bg-orange-500/8 scale-[1.01]'
												: 'border-gray-200 bg-white/2 hover:border-orange-500/60 hover:bg-orange-500/5'
										}`}
									>
										<input
											ref={fileInputRef}
											type="file"
											accept=".mp3,.wav,.m4a,.ogg,.webm,.flac,.aac,.mp4"
											onChange={handleFileInputChange}
											className="hidden"
										/>
										{/* Glow background */}
										<div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
											style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(108,99,255,0.08) 0%, transparent 70%)' }}
										/>
										<div className="relative">
											<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/12 text-orange-500 shadow-[0_8px_24px_rgba(108,99,255,0.15)] transition-transform duration-200 group-hover:scale-105">
												<Upload size={30} />
											</div>
											<h4 className="text-base font-bold text-gray-900">Drag & drop your file here</h4>
											<p className="mt-1 text-sm text-gray-500">or click to browse files</p>
											<p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-gray-100 bg-gray-100 px-4 py-1.5 text-xs text-gray-500">
												MP3 · WAV · M4A · OGG · WebM · FLAC · AAC · MP4 · Max 50MB
											</p>
										</div>
									</div>
								) : (
									<div className="group flex items-start gap-4 rounded-xl border border-orange-500/25 bg-orange-500/8 p-4 transition hover:border-orange-500/40">
										<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-500">
											<FileAudio size={26} />
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-semibold text-gray-900">{audioFile.name}</p>
											<p className="mt-0.5 text-xs text-gray-500">
												{formatFileSize(audioFile.size)} · {audioFile.type || 'audio/video'}
											</p>
											{audioFile.name.toLowerCase().endsWith('.mp4') && (
												<span className="mt-2 inline-block rounded-md border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 text-xs text-amber-300">
													Video file detected — audio will be extracted automatically
												</span>
											)}
										</div>
										<button
											type="button"
											className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 transition hover:bg-rose-500/10 hover:text-rose-400"
											onClick={() => { setAudioFile(null); setFeedback(null); }}
										>
											<X size={14} />
										</button>
									</div>
								)}
							</>
						) : (
							<>
								<div className="mb-5 flex items-center gap-2.5">
									<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
										<FileText size={15} />
									</div>
									<h3 className="text-base font-bold text-gray-900">Text Transcript</h3>
								</div>
								<textarea
									className="min-h-[220px] w-full resize-y rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500/60 focus:bg-gray-100 focus:ring-2 focus:ring-orange-500/15"
									placeholder="Paste the transcription or call speech text here…"
									value={textContent}
									onChange={(e) => setTextContent(e.target.value)}
								/>
							</>
						)}

						{/* Submit button */}
						<button
							type="submit"
							disabled={!canSubmit}
							className="group relative mt-5 inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-orange-500 px-5 py-3.5 text-sm font-bold text-gray-900 shadow-[0_16px_40px_rgba(108,99,255,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(108,99,255,0.45)] disabled:cursor-not-allowed disabled:opacity-50"
						>
							<div className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-[100%]" />
							<Zap size={17} />
							Run AI Analysis Pipeline
							<ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
						</button>
					</section>
				</form>

				{/* ── Right: Info panels ── */}
				<div className="flex flex-col gap-5">

					{/* What AI detects */}
					<section className="rounded-2xl border border-gray-200 bg-[#ffffff]/90 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.25)] backdrop-blur-md">
						<div className="mb-4 flex items-center gap-2.5">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
								<Cpu size={15} />
							</div>
							<h3 className="text-sm font-bold text-gray-900">What AI Detects</h3>
							<span className="ml-auto rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[11px] font-semibold text-orange-500">
								{DETECTION_ITEMS.length}+ signals
							</span>
						</div>
						<div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
							{DETECTION_ITEMS.map((item) => (
								<div
									key={item.label}
									className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 transition hover:border-gray-200 hover:bg-gray-50"
								>
									<span className="text-base">{item.icon}</span>
									<div className="min-w-0">
										<p className="truncate text-xs font-semibold text-gray-700">{item.label}</p>
										<p className="truncate text-[10px] text-gray-400">{item.description}</p>
									</div>
								</div>
							))}
						</div>
					</section>

					{/* Pipeline steps */}
					<section className="rounded-2xl border border-gray-200 bg-[#ffffff]/90 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.25)] backdrop-blur-md">
						<div className="mb-4 flex items-center gap-2.5">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
								<Info size={15} />
							</div>
							<h3 className="text-sm font-bold text-gray-900">AI Pipeline Steps</h3>
						</div>
						<div className="flex flex-col gap-0">
							{PIPELINE_ITEMS.map((item, idx) => (
								<div key={item} className="flex items-start gap-3 py-2">
									<div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-[10px] font-bold text-orange-500">
										{idx + 1}
									</div>
									<span className="flex-1 text-xs text-gray-500 leading-relaxed">{item}</span>
								</div>
							))}
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}

export default AnalyzeCall;
