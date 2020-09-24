const optRe = /\{:([A-Za-z0-9]):\}/
const replaceOptions = (text) => {
  if (text.match(optRe)) {
    let curIdx = text.search(optRe)
    text = text.replace(optRe, "($1)")
    let optIdx = text.search(optRe)
    let blankIdx = text.substr(curIdx).search(/^\s*\n*$/m)
    if (blankIdx === -1 && optIdx > 0) {
      text = replaceOptions(text)
    } else if ((blankIdx+curIdx) < optIdx || optIdx === -1) {
      console.log(text)
      text = [text.slice(0, blankIdx+curIdx), ":input:", text.slice(blankIdx+curIdx)].join('')
    } else if (blankIdx === -1 && optIdx === -1) {
      text = text + ":input:"
    } 
    text = replaceOptions(text)
  } 
  return text
}
const replacePlaceholders = (text) => {
  console.log(text)
  text = text.replaceAll(":success:", "✅")
  text = text.replaceAll(":error:","❗️")
  text = text.replaceAll(":alert:","⚠️")
  text = replaceOptions(text)
  return text
}
export default replacePlaceholders