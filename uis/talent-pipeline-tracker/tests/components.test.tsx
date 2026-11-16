import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup } from "@testing-library/react";

import { CandidateFilters } from "@/components/CandidateFilters";
import { CandidateForm } from "@/components/CandidateForm";
import { CandidateList } from "@/components/CandidateList";
import { NotesPanel } from "@/components/NotesPanel";
import { PipelineControls } from "@/components/PipelineControls";
import { candidate, jsonResponse, mockApi, note } from "./helpers";

// --- next/navigation simulado: la URL vive en `currentUrl` ----------------------------------
let currentUrl = "/";
const replace = vi.fn((url: string) => {
  currentUrl = url;
});
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(currentUrl.split("?")[1] ?? ""),
  useParams: () => ({ id: "c-1" }),
}));

beforeEach(() => {
  currentUrl = "/";
  replace.mockClear();
});
afterEach(cleanup);

const list = (data = [candidate(), candidate({ id: "c-2", full_name: "Pablo Gil", status: "received", stage: "pending" })]) =>
  jsonResponse({ total: data.length, page: 1, limit: 200, data });

describe("Listado", () => {
  it("muestra nombre, puesto, estado y etapa con etiquetas (nunca valores de la API)", async () => {
    mockApi([{ method: "GET", path: /\/records$/, respond: () => list() }]);
    render(<CandidateList />);
    expect((screen.getByRole("status")).textContent).toContain("Cargando candidaturas…");
    const table = await screen.findByRole("table");
    expect(within(table).getByText("Laura Martín")).toBeTruthy();
    expect(within(table).getAllByText("Asistente de Dirección")).toHaveLength(2);
    expect(within(table).getByText("En proceso")).toBeTruthy();
    expect(within(table).getByText("Entrevista personal")).toBeTruthy();
    expect(table.textContent).not.toMatch(/in_progress|personal_interview|received|pending/);
    expect(screen.getByRole("link", { name: "Laura Martín" }).getAttribute("href")).toBe("/candidates/c-1");
    expect(table.textContent).not.toContain("Buena entrevista"); // las notas solo en el detalle
  });

  it("pide a la API los filtros de la URL", async () => {
    currentUrl = "/?status=selected&stage=review&search=laura";
    const fetchMock = mockApi([{ method: "GET", path: /\/records$/, respond: () => list([]) }]);
    render(<CandidateList />);
    expect(await screen.findByText("No hay candidaturas con estos filtros.")).toBeTruthy();
    expect(String(fetchMock.mock.calls[0]![0])).toContain("status=selected&stage=review&search=laura");
  });

  it("muestra el error y permite reintentar", async () => {
    let fail = true;
    mockApi([{ method: "GET", path: /\/records$/, respond: () => (fail ? jsonResponse({ detail: "Servicio caído" }, 500) : list()) }]);
    render(<CandidateList />);
    expect((await screen.findByRole("alert")).textContent).toContain("Servicio caído");
    fail = false;
    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByRole("table")).toBeTruthy();
  });
});

describe("Filtros (query params, sin recargar)", () => {
  it("estado y etapa actualizan la URL con router.replace", async () => {
    const { rerender } = render(<CandidateFilters />);
    await userEvent.selectOptions(screen.getByLabelText("Estado"), "En proceso");
    expect(replace).toHaveBeenLastCalledWith("/?status=in_progress", { scroll: false });
    rerender(<CandidateFilters />); // en Next, router.replace vuelve a renderizar con la URL nueva
    expect((screen.getByLabelText("Estado") as HTMLSelectElement).value).toBe("in_progress");
    await userEvent.selectOptions(screen.getByLabelText("Etapa"), "Oferta presentada");
    expect(replace).toHaveBeenLastCalledWith("/?status=in_progress&stage=offer_presented", { scroll: false });
  });

  it("la búsqueda se aplica al dejar de escribir y se puede limpiar todo", async () => {
    render(<CandidateFilters />);
    await userEvent.type(screen.getByLabelText("Buscar por nombre o email"), "laura");
    await waitFor(() => expect(replace).toHaveBeenLastCalledWith("/?search=laura", { scroll: false }));
    expect(replace).toHaveBeenCalledTimes(1); // una sola navegación, no una por tecla
    currentUrl = "/?search=laura";
    cleanup();
    render(<CandidateFilters />);
    await userEvent.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(replace).toHaveBeenLastCalledWith("/", { scroll: false });
  });
});

describe("Detalle: estado y etapa (PATCH)", () => {
  it("cambia el estado con una interacción y refleja el cambio", async () => {
    const fetchMock = mockApi([{ method: "PATCH", path: /\/records\/c-1$/, respond: () => jsonResponse(candidate({ status: "selected" })) }]);
    const onUpdated = vi.fn();
    render(<PipelineControls candidate={candidate()} onUpdated={onUpdated} />);
    await userEvent.selectOptions(screen.getByLabelText("Estado"), "Seleccionada");
    expect(await screen.findByText("Estado actualizado a «Seleccionada».")).toBeTruthy();
    expect(fetchMock.mock.calls[0]![1]).toMatchObject({ method: "PATCH", body: '{"status":"selected"}' });
    expect(onUpdated).toHaveBeenCalledWith(expect.objectContaining({ status: "selected" }));
  });

  it("muestra el error si el PATCH falla", async () => {
    mockApi([{ method: "PATCH", path: /records/, respond: () => jsonResponse({ detail: "No permitido" }, 400) }]);
    render(<PipelineControls candidate={candidate()} onUpdated={vi.fn()} />);
    await userEvent.selectOptions(screen.getByLabelText("Etapa"), "Entrevista técnica");
    expect((await screen.findByRole("alert")).textContent).toContain("No permitido");
  });
});

describe("Notas", () => {
  it("lista, añade y elimina sin recargar", async () => {
    const fetchMock = mockApi([
      { method: "GET", path: /\/records\/c-1\/notes$/, respond: () => jsonResponse({ data: [note()], meta: { total: 1 } }) },
      { method: "POST", path: /\/records\/c-1\/notes$/, respond: () => jsonResponse(note({ id: "n-2", content: "Pasa a entrevista técnica." }), 201) },
      { method: "DELETE", path: /\/records\/c-1\/notes\/n-1$/, respond: () => jsonResponse(null, 204) },
    ]);
    render(<NotesPanel candidateId="c-1" />);
    expect(await screen.findByText("Buena entrevista telefónica.")).toBeTruthy();

    await userEvent.type(screen.getByLabelText(/Nueva nota/), "Pasa a entrevista técnica.");
    await userEvent.click(screen.getByRole("button", { name: "Añadir nota" }));
    expect(await screen.findByText("Pasa a entrevista técnica.")).toBeTruthy();
    expect(screen.getByText("Nota añadida.")).toBeTruthy();

    await userEvent.click(screen.getAllByRole("button", { name: "Eliminar nota" })[1]!);
    await waitFor(() => expect(screen.queryByText("Buena entrevista telefónica.")).toBeNull());
    expect(fetchMock.mock.calls.filter(([, init]) => (init?.method ?? "GET") === "GET")).toHaveLength(1); // sin recargar la lista
  });

  it("no envía notas vacías", async () => {
    const fetchMock = mockApi([{ method: "GET", path: /notes$/, respond: () => jsonResponse({ data: [], meta: { total: 0 } }) }]);
    render(<NotesPanel candidateId="c-1" />);
    await screen.findByText("Todavía no hay notas.");
    await userEvent.click(screen.getByRole("button", { name: "Añadir nota" }));
    expect((screen.getByRole("alert")).textContent).toContain("La nota no puede estar vacía.");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("Formulario de alta y edición", () => {
  it("valida antes de enviar y no llama a la API si hay errores", async () => {
    const onSubmit = vi.fn();
    render(<CandidateForm mode="create" onSubmit={onSubmit} cancelHref="/" />);
    await userEvent.click(screen.getByRole("button", { name: "Registrar candidatura" }));
    expect((screen.getByRole("alert")).textContent).toContain("Revisa los campos marcados");
    expect(screen.getByText("Escribe nombre y apellido.")).toBeTruthy();
    expect(screen.getByLabelText(/Nombre completo/).getAttribute("aria-invalid")).toBe("true");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("envía los datos válidos y muestra el éxito", async () => {
    const onSubmit = vi.fn(async () => candidate({ id: "c-9", full_name: "Marta Ruiz" }));
    render(<CandidateForm mode="create" onSubmit={onSubmit} cancelHref="/" />);
    await userEvent.type(screen.getByLabelText(/Nombre completo/), "Marta Ruiz");
    await userEvent.type(screen.getByLabelText(/Email/), "marta@example.com");
    await userEvent.type(screen.getByLabelText(/Teléfono/), "+34 600 111 222");
    await userEvent.type(screen.getByLabelText(/Años de experiencia/), "4");
    await userEvent.click(screen.getByRole("button", { name: "Registrar candidatura" }));
    expect(await screen.findByText("Candidatura de Marta Ruiz registrada.")).toBeTruthy();
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ full_name: "Marta Ruiz", position: "Asistente de Dirección", experience_years: 4 }));
    expect(screen.getByRole("link", { name: /Ver la candidatura de Marta Ruiz/ }).getAttribute("href")).toBe("/candidates/c-9");
  });

  it("en edición precarga los datos y muestra el error de la API", async () => {
    const onSubmit = vi.fn(async () => {
      throw new Error("email: value is not a valid email address");
    });
    render(
      <CandidateForm
        mode="edit"
        initialValues={{ full_name: "Laura Martín", email: "laura@example.com", phone: "+34 976 123 456", position: "Asistente de Dirección", linkedin_url: "", cv_url: "", experience_years: "6" }}
        onSubmit={onSubmit}
        cancelHref="/candidates/c-1"
      />,
    );
    expect((screen.getByLabelText(/Nombre completo/) as HTMLInputElement).value).toBe("Laura Martín");
    await userEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect((await screen.findByRole("alert")).textContent).toContain("value is not a valid email address");
  });
});
