import { describe, expect, it } from "vitest";
import { mesclarChaves } from "../src/lib/url.ts";

/**
 * O helper puro que deixa a calculadora (`uf`, `tarifa`, `horas`, `dias`) e a
 * seleção (`ids`) conviverem na mesma querystring da comparação, sem que uma
 * ilha apague as chaves da outra.
 */
describe("mesclar chaves na querystring", () => {
  it("preserva as chaves que não são substituídas", () => {
    const busca = mesclarChaves(
      new URLSearchParams("ids=a,b&uf=RJ&horas=6&from=home"),
      ["ids"],
      new URLSearchParams("ids=c"),
    );

    expect(Object.fromEntries(busca)).toEqual({
      uf: "RJ",
      horas: "6",
      from: "home",
      ids: "c",
    });
  });

  it("remove a chave quando a nova busca está vazia", () => {
    const busca = mesclarChaves(
      new URLSearchParams("ids=a,b&uf=RJ"),
      ["ids"],
      new URLSearchParams(),
    );

    expect(busca.toString()).toBe("uf=RJ");
  });

  it("não altera a busca recebida", () => {
    const original = new URLSearchParams("ids=a&uf=SP");
    mesclarChaves(original, ["ids"], new URLSearchParams("ids=b"));
    expect(original.get("ids")).toBe("a");
  });
});
