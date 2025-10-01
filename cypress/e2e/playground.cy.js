/// <reference types="cypress" />

describe("Aplicação Cypress Playground", () => {
  beforeEach(() => {
    const now = new Date(2024, 3, 15);
    cy.clock(now);

    cy.visit(
      "https://cypress-playground.s3.eu-central-1.amazonaws.com/index.html"
    );
  });

  it("clica em um botão e verifica mensagem de sucesso", () => {
    cy.get('button[type="submit"]:contains(Subscribe)')
      .should("be.visible")
      .click();

    cy.get("#success").should("be.visible");
  });

  it("escreve o nome no campo assinatura e verifica se a assinatura aparece corretamente", () => {
    let nome = "Fulano de tal";
    cy.get("#signature-textarea").as("campoNomeAssinatura");
    cy.get("@campoNomeAssinatura").should("be.visible").type(nome);

    cy.get("@campoNomeAssinatura").should("have.value", nome);
    cy.get("#signature").should("be.visible").and("have.text", nome);
  });

  it("digita o nome no segundo campo de assinatura, marca caixa de seleção para previsualizar a assinatura e depois válida se a previsualiação foi exibida", () => {
    let nome = "Ciclano De Souza";
    cy.get("#signature-textarea-with-checkbox").as(
      "campoAssinaturaComCaixaDeSelecao"
    );
    cy.get("@campoAssinaturaComCaixaDeSelecao").should("be.visible").type(nome);

    cy.get("@campoAssinaturaComCaixaDeSelecao").should("have.value", nome);

    cy.get("#signature-checkbox").as("caixaSelecaoAssinatura");
    cy.get("@caixaSelecaoAssinatura").should("be.visible").check();

    cy.get("@caixaSelecaoAssinatura").should("be.checked");
  });

  it("marca os inputs de on e off e valida se o texto exibido está correto", () => {
    cy.get('input[type="radio"]#on').as("radioButtonOn");
    cy.get("input[type='radio']#off").as("radioButtonOff");
    cy.get("#on-off").as("textoOnOff");

    cy.get("@radioButtonOn").should("be.visible").check();
    cy.get("@radioButtonOff").should("not.be.checked");
    cy.get("@textoOnOff").should("be.visible").and("have.text", "ON");

    cy.get("@radioButtonOff").should("be.visible").check();
    cy.get("@radioButtonOn").should("not.be.checked");
    cy.get("@textoOnOff").should("be.visible").and("have.text", "OFF");
  });

  it("selecione valores de uma tag <select> e certifica que o tipo correto seja exibido", () => {
    let opcoesSelect = ["BASIC", "STANDARD", "VIP"];

    cy.get("select#selection-type").as("campoSelecao");
    cy.get("@campoSelecao").should("be.visible");

    cy.get("@campoSelecao").select(1);
    cy.get("#select-selection > strong").as("textoCampoSelecao");
    cy.get("@textoCampoSelecao")
      .should("be.visible")
      .and("have.text", opcoesSelect[0]);

    cy.get("@campoSelecao").select("standard");
    cy.get("@textoCampoSelecao")
      .should("be.visible")
      .and("have.text", opcoesSelect[1]);

    cy.get("@campoSelecao").select("VIP");
    cy.get("@textoCampoSelecao")
      .should("be.visible")
      .and("have.text", opcoesSelect[2]);
  });
  it("selecione multiplos valores de uma tag <select> e certifica que os tipos corretos seja exibidos", () => {
    let opcoesFrutasSelect = [
      "apple",
      "banana",
      "cherry",
      "date",
      "elderberry",
    ];

    cy.get("select[multiple]#fruit").as("selecaoFrutas");

    cy.get("@selecaoFrutas").should("be.visible").select(opcoesFrutasSelect);

    const textoEsperado = opcoesFrutasSelect.join(", ");
    cy.get("#fruits-paragraph > strong").should("contain.text", textoEsperado);
  });

  it("realizar upload de arquivo", () => {
    cy.get("input[type='file']#file-upload")
      .as("campoArquivo")
      .should("be.visible")
      .selectFile("./cypress/fixtures/example.json");

    cy.get("@campoArquivo").then(($input) => {
      expect($input[0].files[0].name).to.equal("example.json");
    });
  });

  it("intercepta uma requisição", () => {
    cy.intercept("https://jsonplaceholder.typicode.com/todos/1").as("getTodo");
    cy.get("#intercept > button:contains(Get TODO)")
      .should("be.visible")
      .click();

    cy.wait("@getTodo").its("response.statusCode").should("equal", 200);

    cy.get("#intercept > ul > li")
      .should("be.visible")
      .and("contain", "TODO ID")
      .and("contain", "Title")
      .and("contain", "Completed")
      .and("contain", "User ID");
  });

  it("interceptando a requisição acionada ao clicar no botão Get TODO, mas utilizando fixture na requisição", () => {
    const todo = require("../fixtures/todo.json");

    cy.intercept("https://jsonplaceholder.typicode.com/todos/1", {
      fixture: "todo.json",
    }).as("getTodo");

    cy.get("#intercept > button:contains(Get TODO)")
      .should("be.visible")
      .click();

    cy.wait("@getTodo").its("response.statusCode").should("equal", 200);

    cy.contains("li", `TODO ID: ${todo.id}`).should("be.visible");
    cy.contains("li", `User ID: ${todo.userId}`).should("be.visible");
    cy.contains("li", `Title: ${todo.title}`).should("be.visible");
    cy.contains("li", `Completed: ${todo.completed}`).should("be.visible");
  });

  it("interceptando a requisição acionada ao clicar no botão Get TODO, mas simulando uma falha de API", () => {
    const todo = require("../fixtures/todo.json");

    cy.intercept("https://jsonplaceholder.typicode.com/todos/1", {
      fixture: "todo.json",
      statusCode: 500,
    }).as("getServerFailure");

    cy.get("#intercept > button:contains(Get TODO)")
      .should("be.visible")
      .click();

    cy.wait("@getServerFailure")
      .its("response.statusCode")
      .should("equal", 500);

    cy.get("#intercept > .error")
      .should("be.visible")
      .and(
        "contain",
        "Oops, something went wrong. Refresh the page and try again."
      );
  });

  it("intercepta a requisição acionada ao clicar no botão Get TODO, simulando uma falha na rede", () => {
    const todo = require("../fixtures/todo.json");

    cy.intercept("https://jsonplaceholder.typicode.com/todos/1", {
      forceNetworkError: true,
    }).as("networkError");

    cy.get("#intercept > button:contains(Get TODO)")
      .should("be.visible")
      .click();

    cy.wait("@networkError");

    cy.get("#intercept > .error")
      .should("be.visible")
      .and(
        "contain",
        "Oops, something went wrong. Check your internet connection, refresh the page, and try again."
      );
  });
  it("realiza requisição com cy.request()", () => {
    cy.request("GET", "https://jsonplaceholder.typicode.com/todos/1")
      .its("status")
      .should("be.equal", 200);
  });

  it("seleciona e defini um valor em um input range", () => {
    const index = 5;
    cy.get('input[type="range"]#level').as("inputRange");
    cy.get("@inputRange")
      .should("be.visible")
      .invoke("val", index)
      .should("have.value", index)
      .trigger("change");

    cy.get("#level-paragraph > strong")
      .should("be.visible")
      .and("have.text", "5");
  });
  it("definindo uma data e desfocando o elemento", () => {
    const date = "2024-10-25";
    cy.get('input[type="date"]#date').should("be.visible").as("inputDate");
    cy.get("@inputDate").type(date);

    cy.get("@inputDate").should("have.value", date).blur();
    cy.get("#date-paragraph > strong").should("have.text", date);
  });

  it('digita no campo senha com dados informados no arquivo cypress.env.json. Depois marca e desmarca a caixa de seleção "Show password" e certifica de que a senha seja exibida e depois mascarada', () => {
    cy.get("input#password").as("inputPassword");
    cy.get("@inputPassword")
      .should("be.visible")
      .type(Cypress.env("user_password"), { log: false });

    cy.get("@inputPassword").should("have.value", Cypress.env("user_password"));

    cy.get("#show-password-checkbox").as("mostrarSenha");
    cy.get("@mostrarSenha").should("be.visible").check();
    cy.get("@inputPassword").should("have.attr", "type", "text");

    cy.get("@mostrarSenha").should("be.visible").uncheck();
    cy.get("@inputPassword").should("have.attr", "type", "password");
  });
  it("pega os elementos de uma tabela e valida a quantidade", () => {
    cy.get("ul#animals > li").as("linhasLista");

    cy.get("@linhasLista").should("be.visible").and("have.length", 5);
  });

  it("congela e verifica a data exibida", () => {
    cy.contains("#date-section-paragraph", "2024-04-15").should("be.visible");
  });

  it("copia o código Your code is:, digita-o e clica no botão Submit", () => {
    cy.get("#timestamp")
      .should("be.visible")
      .then((element) => {
        const value = element[0].innerText;
        cy.get("#code").should("be.visible").type(value);
        cy.get("#code").should("have.value", value);
      });
    cy.contains("button", "Submit").should("be.visible").click();
    cy.contains(".success", "Congrats! You've entered the correct code.");
  });

  it("digita o código Your code errado no campo e clica no botão Submit", () => {
    const value = "12345678";
    cy.get("#code").as("campoYourCode");
    cy.get("@campoYourCode").should("be.visible").type(value);
    cy.get("@campoYourCode").should("have.value", value);

    cy.contains("button", "Submit").should("be.visible").click();
    cy.contains(
      ".error",
      "The provided code isn't correct. Please, try again."
    );
  });

  it("clica no link para baixar um arquivo e verifica o arquivo", () => {
    cy.contains("a", "Download a text file").should("be.visible").click();
    cy.readFile("cypress/downloads/example.txt").should(
      "include",
      "Hello, World!"
    );
  });
});
