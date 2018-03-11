function JSPrompt(title, placeholder, callback) {
    swal({
        title: title,
        text: "",
        content: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        animation: "slide-from-top",
        inputPlaceholder: placeholder })
    .then(callback);
}

function parseRarity(rarity) {
    switch (rarity) {
        case 0:
            return "Common";
        case 1:
            return "Uncommon";
        case 2:
            return "Rare";
        case 3:
            return "Unique";
        default:
            return "Unknown";
    }
}

function parseError(error) {
    if (error.search("invalid JUMP") >= 0) {
        return "Invalid JUMP";
    }

    if (error.search("invalid opcode") >= 0) {
        return "Invalid Opcode";
    }

    if (error.search("out of gas") >= 0) {
        return "Out of gas";
    }

    if (error.search("revert") >= 0) {
        return "revert";
    }

    return "Unknown error";
}
