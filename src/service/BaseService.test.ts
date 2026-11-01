import { describe, expect, it } from "vitest";
import { parseDownloadFilename } from "./BaseService";

describe("parseDownloadFilename", () => {
  it("lê o filename simples", () => {
    expect(
      parseDownloadFilename('attachment; filename="relatorio_20261101.pdf"')
    ).toBe("relatorio_20261101.pdf");
  });

  it("prefere filename* ao filename em RFC 2047", () => {
    expect(
      parseDownloadFilename(
        "attachment; filename=\"=?UTF-8?Q?relatorio=5F20261101.pdf?=\"; filename*=UTF-8''relatorio_20261101.pdf"
      )
    ).toBe("relatorio_20261101.pdf");
  });

  it("usa o nome padrão sem o header", () => {
    expect(parseDownloadFilename(undefined)).toBe("export");
  });
});
