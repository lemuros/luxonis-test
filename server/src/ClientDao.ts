import { Client } from "./Client";

export class ClientDAO {
  private readonly clients = new Map<string, Client>();
  private readonly unusedIds = new Set<string>();

  public getNextId(): string {
    if (this.unusedIds.size > 0) {
      const [id] = this.unusedIds;
      this.unusedIds.delete(id);
      return id;
    }
    if (this.clients.size === 0) {
      return "1";
    }
    const clientIds = Array.from(this.clients.keys());
    const clientIdNumbers = clientIds.map((id) => parseInt(id, 10));
    const maxId = Math.max(...clientIdNumbers);
    return String(maxId + 1);
  }

  public insertClient(client: Client) {
    const id = client.id;
    if (this.clients.get(id)) {
      throw new Error(
        `Cannot insert Client with id ${id} as it already exists`
      );
    }
    this.clients.set(id, client);
  }

  public removeClient(id: string) {
    const client = this.clients.get(id);
    client?.connection.destroy();
    this.clients.delete(id);
    this.unusedIds.add(id);
  }

  public getClientList(): Array<Client> {
    return Array.from(this.clients.values());
  }

  public getClient(id: string): Client {
    const client = this.clients.get(id);
    if (!client) {
      throw new Error(`Cannot find Client ${id}`);
    }
    return client;
  }
}
