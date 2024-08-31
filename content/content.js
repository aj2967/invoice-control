function addButton() {
	let targetElement = document.getElementById("docs-titlebar-share-client-button");
	const button = document.createElement("button");

	// Button Styles
	button.id = "exportPdfButton";
	button.textContent = "Export";
	button.style.position = "block";

	// Google share button styles
	button.style.padding = "9px 24px";
	button.style.borderRadius = "100px";
	button.style.fontFamily = "Google Sans, Roboto, sans-serif";
	button.style.fontSize = "14px";
	button.style.fontWeight = "500";
	button.style.height = "40px";
	button.style.lineHeight = "20px";
	button.style.whiteSpace = "nowrap";
	button.style.background = "#c2e7ff";
	button.style.color = "#001d35";

	// Place button in the Sheet
	targetElement.parentNode.insertBefore(button, targetElement.nextSibling);

	// Initiate export flow on click event
	button.addEventListener("click", async () => {
		try {
			// Input validation
			const inputData = await requestPopupData();
			if (!inputData.folderInput || inputData.folderInput === undefined || inputData.folderInput === "") {
				notify("Failed", "Please enter a valid folder ID in the extension popup configuration.");
				throw new Error("Please enter a valid folder ID in the extension popup configuration.");
			}

			// Initiate loading state
			button.classList.add("isLoading");

			// Check if user is authenticated
			await getUser();
			console.log("==== 1. User authenticated ====");

			// Save the current file as a PDF
			const pdfData = await saveAsPdf();
			console.log("==== 2. PDF saved ====");

			// Process and upload PDF data
			await uploadToDrive(pdfData);
			console.log("==== 3. PDF uploaded ====");

			button.classList.remove("isLoading");
		} catch (error) {
			button.classList.remove("isLoading");
			notify("Failed to export", "Please refresh the browser and try again.");
			console.error("Invoice Control - Error during export:", error);
		}
	});
}

// Process PDF file
function getSpreadsheetId() {
	const url = window.location.href;
	const matches = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
	return matches ? matches[1] : null;
}

function getSelectedSheetId() {
	const url = window.location.href;
	const params = new URLSearchParams(url.split("?")[1]);
	return params.get("gid");
}

function extractInvoiceNumber(cellValue) {
	const match = cellValue.match(/Invoice:\s*(\d+)/);
	return match ? match[1] : null;
}

async function getCellValue(spreadsheetId, cellRange, token) {
	const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${cellRange}`;
	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch cell value");
	}

	const data = await response.json();
	return data.values[0][0];
}

async function saveAsPdf() {
	const token = await getAuthTokenFromStorage();
	const spreadsheetId = getSpreadsheetId();
	const selectedSheetId = getSelectedSheetId();
	const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=pdf&gid=${selectedSheetId}&fitw=true&size=letter&portrait=true&sheetnames=false&printtitle=false&pagenum=UNDEFINED&gridlines=false&fzr=false`;

	const response = await fetch(url, {
		headers: {
			Authorization: "Bearer " + token,
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch PDF");
	}

	return await response.blob();
}

async function uploadToDrive(pdfData) {
	try {
		const token = await getAuthTokenFromStorage();
		const inputData = await requestPopupData();
		const spreadsheetId = getSpreadsheetId();
		const cellValue = await getCellValue(spreadsheetId, "Invoice!D12", token);
		let invoiceNumber = extractInvoiceNumber(cellValue) || new Date().getTime();

		if (!inputData.folderInput) {
			throw new Error("Failed to get Drive Folder ID");
		}

		const metadata = {
			name: `${invoiceNumber}.pdf`,
			mimeType: "application/pdf",
			parents: [inputData.folderInput],
		};

		const form = new FormData();
		form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
		form.append("file", pdfData);

		const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
			method: "POST",
			headers: {
				Authorization: "Bearer " + token,
			},
			body: form,
		});

		if (!response.ok) {
			throw new Error(`Failed to upload file: ${response.statusText}`);
		}

		const file = await response.json();
		notify("Success", "File uploaded to Google Drive");
	} catch (error) {
		console.error("Error during uploading to drive:", error);
		throw error;
	}
}

async function getBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result.split(",")[1]);
		reader.onerror = (error) => reject(error);
	});
}

// Google OAuth2 Authentication
function getAuthToken() {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({ type: "getAuthToken" }, function (response) {
			if (response.error) {
				reject(response.error);
			} else {
				resolve(response.token);
			}
		});
	});
}

function getAuthTokenFromStorage() {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({ type: "getToken" }, function (response) {
			if (response.error) {
				reject(response.error);
			} else {
				resolve(response.token);
			}
		});
	});
}

async function fetchUserInfo(token) {
	const response = await fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch user info");
	}

	return await response.json();
}

async function getUser() {
	try {
		let token = await getAuthToken();
		let userInfo = await fetchUserInfo(token);

		if (userInfo) {
			// Save user and token data to local storage
			chrome.runtime.sendMessage({ type: "saveToken", token: token });
			chrome.runtime.sendMessage({ type: "saveUserInfo", userInfo: userInfo });
		}
	} catch (error) {
		console.error("Failed to authenticate user:", error);
		throw error;
	}
}

// Helper Functions
function requestPopupData() {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(["folderInput"], function (result) {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError);
			} else {
				resolve({
					folderInput: result.folderInput,
				});
			}
		});
	});
}

const notify = (title, message) => {
	chrome.runtime.sendMessage({ type: "notify", title: title, message: message });
};

// Initialise script
(init = () => {
	addButton();
})();
