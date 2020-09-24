const replacePlaceholders = (text) => {
  text = text.replace(":success:", "✅")
  text = text.replace(":error:","❗️")
  text = text.replace(":alert:","⚠️")
  if (text.match(/\{:([A-Za-z0-9]):\}/)) {
    text = text.replace(/\{:([A-Za-z0-9]):\}/g, "($1)")
    text += ":input:"
  }
  return text
}
export default replacePlaceholders