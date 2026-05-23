"use client";

import { useState, type FormEvent } from "react";

type ServiceOption = {
	id: number;
	name: string;
};

type RequestServiceFormProps = {
	services: ServiceOption[];
};

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function RequestServiceForm({
	services,
}: RequestServiceFormProps) {
	const [status, setStatus] = useState<FormStatus>("idle");
	const [message, setMessage] = useState<string | null>(null);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setStatus("submitting");
		setMessage(null);

		const form = event.currentTarget;
		const formData = new FormData(form);
		const serviceId = Number(formData.get("serviceId"));

		if (!Number.isInteger(serviceId) || serviceId <= 0) {
			setStatus("error");
			setMessage("Please select a service type.");
			return;
		}

		const payload = {
			customerName: String(formData.get("customerName") ?? ""),
			phone: String(formData.get("phone") ?? ""),
			city: String(formData.get("city") ?? ""),
			serviceId,
			description: String(formData.get("description") ?? ""),
		};

		try {
			const response = await fetch("/api/leads", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			const body = await response.json().catch(() => ({}));

			if (!response.ok) {
				setStatus("error");
				setMessage(body?.error ?? "Unable to submit your request.");
				return;
			}

			setStatus("success");
			setMessage("Request submitted. Providers will reach out soon.");
			form.reset();
		} catch {
			setStatus("error");
			setMessage("Network error. Please try again.");
		}
	};

	return (
		<form className="mt-8 space-y-5" onSubmit={handleSubmit}>
			<div className="grid gap-4 sm:grid-cols-2">
				<label className="flex flex-col gap-2 text-sm font-medium">
					Name
					<input
						required
						name="customerName"
						placeholder="Jane Doe"
						className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:border-zinc-500 focus:outline-none"
					/>
				</label>
				<label className="flex flex-col gap-2 text-sm font-medium">
					Phone Number
					<input
						required
						name="phone"
						placeholder="9999999999"
						className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:border-zinc-500 focus:outline-none"
					/>
				</label>
			</div>

			<label className="flex flex-col gap-2 text-sm font-medium">
				City
				<input
					required
					name="city"
					placeholder="Bengaluru"
					className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:border-zinc-500 focus:outline-none"
				/>
			</label>

			<label className="flex flex-col gap-2 text-sm font-medium">
				Service Type
				<select
					required
					name="serviceId"
					defaultValue=""
					className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:border-zinc-500 focus:outline-none"
				>
					<option value="" disabled>
						Select a service
					</option>
					{services.map((service) => (
						<option key={service.id} value={service.id}>
							{service.name}
						</option>
					))}
				</select>
			</label>

			<label className="flex flex-col gap-2 text-sm font-medium">
				Description
				<textarea
					required
					name="description"
					rows={4}
					placeholder="Tell us more about your request"
					className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
				/>
			</label>

			{message ? (
				<p
					className={`text-sm ${
						status === "error" ? "text-red-600" : "text-emerald-600"
					}`}
				>
					{message}
				</p>
			) : null}

			<button
				type="submit"
				disabled={status === "submitting"}
				className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-6 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
			>
				{status === "submitting" ? "Submitting..." : "Submit Request"}
			</button>
		</form>
	);
}
