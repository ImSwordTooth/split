export const chip = {
    "transferV3": [
        ["headlineAll:头条新闻", "KVProxy", "getRecommendFragmentByPage", "20003,0,50", {"nodename":".areaFestival","json": true, "filter": ["title","url"]}],
    ],
    "transferV4": [
        ["headlineAll:头条新闻", "KVProxy", "getRecommendFragmentByPage", ["20003","0","50"], {"nodename":".data","json": true, "filter": ["title","url"]}],
        ["customV4", "KVProxy", "getCustom", "doc_7b46005374e4a2ffaa5a77a6da14217b", {"json": true}]
    ]
}
