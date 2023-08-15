import config from "../config.json"

export default function getUrl(url) {
    return config.server.domain + url
}