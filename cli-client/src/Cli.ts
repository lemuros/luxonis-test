import * as rl from "readline";

class Cli {
  private interface: rl.Interface;
  constructor() {
    this.interface = rl.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });
  }

  aborter = new AbortController();

  async askQuestion(questionText: string) {
    this.aborter.abort();
    this.aborter = new AbortController();

    return new Promise<string>((resolve) => {
      this.interface.question(
        `${questionText}: `,
        { signal: this.aborter.signal },
        resolve
      );
    });
  }

  public log(text: string | number) {
    console.log(text);
  }

  public clearDown() {
    rl.clearScreenDown(process.stdin);
  }

  public save() {
    process.stdout.write("\u001b[s");
  }

  public resume() {
    process.stdout.write("\u001b[u");
  }

  public clearDownAndResume() {
    this.resume();
    this.clearDown();
  }
}

export const cli = new Cli();
