
import parseurl from 'parse-url'

export const standardized = (href) => {
  const { host, path } = parse(href)
  return `${host}${path}`
}

export const reachable = (href) => {
  const { host, path } = parse(href)
  return `https://${host}${path}`
}

export const parse = (href) => {
  const { resource, protocol, pathname, query } = parseurl(href)
  return {
    protocol,
    host: resource.replace(/^(www\.)/, ""),
    path: pathname,
    query
  }
}