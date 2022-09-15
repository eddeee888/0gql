import path from "path";

export const changeExtension = (file: string, extension: string) => {
  const basename = path.basename(file, path.extname(file));
  return path.join(path.dirname(file), basename + extension);
};
