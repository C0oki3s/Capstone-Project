exports.escapeHtml = (unsafe) => {
  return unsafe.replace(/[&><"']/g, function (m) {
    switch (m) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#039;";
    }
  });
};
