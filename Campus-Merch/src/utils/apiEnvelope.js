/** 与后端约定一致的业务成功包络（mock 与部分直出场景共用） */
export function ok(data, message = 'ok') {
  return { code: 0, message, data }
}
