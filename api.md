# 小程序 API 接入说明

本文档用于给独立小程序项目和 AI 编程助手提供稳定的服务端接口上下文。接口字段细节以 Swagger / OpenAPI 为准，业务接入流程以本文档为准。

## 基础信息

生产 API 基础地址：

```text
https://pinrren.com/api
```

Swagger 文档：

```text
https://pinrren.com/api/docs
```

OpenAPI JSON：

```text
https://pinrren.com/api/docs-json
```

微信小程序后台需要配置 request 合法域名：

```text
https://pinrren.com
```

## 统一响应结构

成功响应：

```json
{
  "code": "SUCCESS",
  "message": "操作成功",
  "data": {}
}
```

列表响应通常在 `data` 内包含：

```json
{
  "data": [],
  "total": 0
}
```

错误响应：

```json
{
  "code": "UNAUTHORIZED",
  "message": "Unauthorized",
  "details": {
    "traceId": "trace-id"
  }
}
```

常见错误码：

- `UNAUTHORIZED`：未登录、token 缺失或失效。
- `FORBIDDEN`：已登录但缺少权限。
- `BAD_REQUEST`：参数错误或业务校验失败。
- `NOT_FOUND`：数据不存在。
- `DUPLICATE_ENTRY`：唯一字段重复。

## 登录流程

1. 小程序调用 `wx.login()` 获取 `code`。
2. 请求 `POST /auth/miniprogram/login` 换取 `accessToken`。
3. 将 `accessToken` 存入小程序本地缓存。
4. 后续请求统一携带：

```http
Authorization: Bearer <accessToken>
```

登录请求示例：

```http
POST /auth/miniprogram/login
Content-Type: application/json
```

```json
{
  "code": "wx-login-code"
}
```

## 小程序推荐接口

### 认证

- `POST /auth/miniprogram/login`：小程序登录。
- `POST /auth/miniprogram/phone`：绑定或更新微信手机号。
- `GET /auth/me`：获取当前登录用户。
- `PATCH /auth/me/profile`：修改当前用户资料。

### 首页

- `GET /home-banners/active`：查询启用中的首页轮播。

### 商品

- `GET /products/categories`：查询商品分类列表。
- `GET /products/categories/with-products`：查询商品分类及每个分类最多 6 条商品预览。
- `GET /products`：查询商品列表，需要 `products:read` 权限。
- `GET /products/:id`：查询商品详情，需要 `products:read` 权限。
- `GET /product-attributes?type=COLOR`：查询商品属性，需要 `product_attributes:read` 权限。

商品属性 `type` 可选值：

```text
CATEGORY, KIND, FIT, MATERIAL, STYLE, COLOR, SIZE
```

### 全局配置

- `GET /global-configs`：查询全局配置，需要 `global_configs:read` 权限。
- `GET /global-configs/:id`：查询全局配置详情，需要 `global_configs:read` 权限。

### 订单

- `POST /orders`：创建订单。
- `GET /orders/my`：查询我的订单列表。
- `GET /orders/my/:id`：查询我的订单详情。

订单状态：

```text
PENDING      待处理
FOLLOWED_UP  已跟进
CLOSED       已关闭
```

## 后台专用接口

小程序不要直接调用以下接口：

- `users`
- `roles`
- `permissions`
- `audit-logs`
- `notifications`
- 商品、商品属性、全局配置、首页轮播的创建、更新、删除接口
- `GET /orders`、`GET /orders/:id`、`PATCH /orders/:id/status`

这些接口面向后台管理，需要管理员角色或对应权限。

## 分页参数

列表接口通常支持：

```text
_start=0
_end=20
_sort=createdAt
_order=DESC
```

示例：

```http
GET /products?_start=0&_end=20&_sort=createdAt&_order=DESC
Authorization: Bearer <accessToken>
```

## 给小程序项目 Codex 的建议上下文

在小程序项目中建议新增：

```text
docs/api/openapi.json
docs/api/miniprogram-api.md
AGENTS.md
```

`docs/api/openapi.json` 可以从线上接口导出：

```bash
curl -L https://pinrren.com/api/docs-json -o docs/api/openapi.json
```

小程序项目的 `AGENTS.md` 可加入：

```md
小程序请求服务端 API 时遵循：
- API_BASE_URL 使用 https://pinrren.com/api
- 接口结构以 docs/api/openapi.json 为准
- 业务流程以 docs/api/miniprogram-api.md 为准
- 先调用 wx.login，再请求 POST /auth/miniprogram/login 获取 accessToken
- 后续请求统一携带 Authorization: Bearer <accessToken>
- 响应结构统一为 { code, message, data }
- 只调用小程序推荐接口，不调用 users、roles、permissions、audit-logs 等后台管理接口
- 遇到 UNAUTHORIZED 时清理 token 并重新登录
- 遇到 FORBIDDEN 时不要静默重试，应提示用户无权限或联系管理员
```
