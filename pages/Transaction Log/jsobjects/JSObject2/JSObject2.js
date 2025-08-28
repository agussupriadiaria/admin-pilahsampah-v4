export default {
	uploadCSVtoMySQL: async () => {
		const file = FilePicker1.files[0];

		if (!file || !file.data) {
			showAlert("No CSV file selected", "error");
			return;
		}

		try {
			const base64Data = file.data;
			const csvString = decodeURIComponent(
				escape(window.atob(base64Data.split(",")[1]))
			);

			const lines = csvString.trim().split("\n");
			if (lines.length < 2) {
				showAlert("CSV file is empty or missing data", "error");
				return;
			}

			// Ambil header dari CSV
			const headers = lines[0].split(",").map(h => h.trim());
			const expectedHeaders = [
				"transactiondate",
				"jumlahbottle",
				"saldo",
				"transactioncode"
			];

			// Validasi header
			const headerMismatch = expectedHeaders.some((h, i) => headers[i] !== h);
			if (headerMismatch) {
				showAlert("CSV header mismatch. Please use correct format.", "error");
				return;
			}

			// Loop tiap baris data
			for (let i = 1; i < lines.length; i++) {
				const values = lines[i].split(",").map(v => v.trim());
				if (values.length < headers.length) continue;

				const row = {};
				headers.forEach((key, index) => {
					row[key] = values[index];
				});

				try {
					await qy_uploadData3.run({
						transactiondate: row.transactiondate, // ✅ diperbaiki
						jumlahbottle: parseInt(row.jumlahbottle),
						saldo: parseInt(row.saldo),
						transactioncode: row.transactioncode
					});
				} catch (err) {
					showAlert(`Insert failed for row ${i + 1}: ${err.message}`, "error");
				}
			}

			showAlert("CSV upload complete. Please reload page !", "success");
		} catch (e) {
			showAlert("Failed to read CSV file: " + e.message, "error");
		}
	}
};
