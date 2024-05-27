export default {
  serialize(error, config, indentation, depth, refs, printer) {
    const { name, status, message } = error

    return `${printer(
      { name, status, message },
      config,
      indentation,
      depth,
      refs,
    )}`
  },
  test(val) {
    // FIXME: update linter to support optional chaining syntax
    // return val instanceof Error && val.name?.startsWith('Joint')
    return val instanceof Error && val.name && val.name.startsWith('Joint')
  },
}
