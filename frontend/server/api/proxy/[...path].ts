export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const path = event.context.params?.path;

  const targetPath = Array.isArray(path) ? path.join("/") : path;

  return proxyRequest(event, `${config.apiUrl}/${targetPath}`);
});
