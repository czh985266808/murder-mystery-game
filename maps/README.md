# 地图图片文件夹

这里放每个剧本的外接地图图片，游戏会在背景故事页自动读取。

## 命名规则

一个剧本可以放一张或多张地图，文件名必须带剧本 id：

- 单张：`<剧本id>-map.<扩展名>`
- 多张：`<剧本id>-map-<序号>.<扩展名>`

例如当前《三更刀响》的 id 是 `sangeng`：

- `maps/sangeng-map.png`
- `maps/sangeng-map-1.png`
- `maps/sangeng-map-2.png`
- `maps/sangeng-map.jpg`
- `maps/sangeng-map.webp`
- `maps/sangeng-map.gif`
- `maps/sangeng-map.avif`

支持 `png / jpg / jpeg / webp / gif / avif`。多张地图按文件名里的数字顺序显示，纯 `-map` 文件排最前面。

## 用法

1. 把图片放进本文件夹，文件名按上面的规则改好。
2. 直接覆盖同名文件即可更新，游戏会按文件修改时间刷新图片。
3. 不需要代码里的简笔画地图，也不需要重新生成图片资源。
4. 当前没有同名地图时，背景故事页会显示外部地图入口提示；放好图片后再刷新页面即可看到。
