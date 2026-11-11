// Case and accents don't count, so "cafe" finds "Café Noir".
function fold(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
}

export { fold }
