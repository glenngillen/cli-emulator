const CommandMatcher = (cmds, cmd) => {
  let matchedIx : Array<number>
  matchedIx = []
  let matched = cmds.filter((item, idx) => {
    if (cmd.toString() === item.cmd) {
      matchedIx.push(idx)
      return true
    } else if (item.cmd.match(/^\/.+\/([gimy]*)$/)) {
      var match = item.cmd.match(new RegExp('^/(.*?)/([gimy]*)$'));
      if (match && cmd.match(new RegExp(match[1], match[2]))) {
        matchedIx.push(idx)
        return true
      }
    }
    return false
  })
  return [matched, matchedIx]
}
export default CommandMatcher