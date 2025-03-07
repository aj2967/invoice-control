// Load user profile and configuration data
document.addEventListener("DOMContentLoaded", function () {
	getUserInfo();
	getPopupData();
});

// Helper functions
const notify = (title, message) => {
	chrome.runtime.sendMessage({ type: "notify", title: title, message: message });
};

// Handle storing and returning popup data
function getPopupData() {
	// Element references
	const folderInput = document.getElementById("folder-input");
	const sheetInput = document.getElementById("sheet-input");
	const cellInput = document.getElementById("cell-input");
	const filenameInput = document.getElementById("filename-input");
	// const emailCheckbox = document.getElementById("email-checkbox");
	const saveButton = document.getElementById("save-button");

	// Load stored values from local storage
	chrome.storage.local.get([
		"folderInput",
		"sheetInput",
		"cellInput",
		"filenameInput"
		// "emailCheckbox"
	], function (result) {
		folderInput.value = result.folderInput || "";
		sheetInput.value = result.sheetInput || "";
		cellInput.value = result.cellInput || "";
		filenameInput.value = result.filenameInput || "";
		// emailCheckbox.checked = result.emailCheckbox || false;
	});

	// Event listener to store user input to local storage
	saveButton.addEventListener("click", storePopupData);
}

function storePopupData() {
	// Element references
	const folderInput = document.getElementById("folder-input").value;
	const sheetInput = document.getElementById("sheet-input").value;
	const cellInput = document.getElementById("cell-input").value;
	const filenameInput = document.getElementById("filename-input").value;
	// const emailCheckbox = document.getElementById("email-checkbox").checked;

	// if (!isValidEmail()) {
	// 	notify("Failed to save", "Please enter valid email addresses in both fields.");
	// 	return false;
	// }

	chrome.storage.local.set({
		folderInput: folderInput,
		sheetInput: sheetInput,
		cellInput: cellInput,
		filenameInput: filenameInput
		// emailCheckbox: emailCheckbox,
	});

	window.close();
	notify("Success", "Settings saved!");
}

// Handle displaying user information
function displayUserInfo(user) {
	const userInfoDiv = document.getElementById("user-info");
	userInfoDiv.innerHTML = `
	<div class="user-info--img">
    	<img src="${user.picture}" alt="User Picture"/>
	</div>

	<div class="user-info--details">
		<p>${user.name}</p>
		<p>${user.email}</p>
	</div>
  `;
}

function getUserInfo() {
	chrome.storage.local.get("userInfo", function (result) {
		if (result.userInfo) {
			displayUserInfo(result.userInfo);
		}
	});
}
