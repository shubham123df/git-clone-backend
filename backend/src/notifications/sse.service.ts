import { Injectable } from '@nestjs/common';

@Injectable()
export class SseService {
  private connections = new Map<string, Response[]>();

  addConnection(userId: string, response: Response) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, []);
    }
    this.connections.get(userId)!.push(response);
  }

  removeConnection(userId: string, response: Response) {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      const index = userConnections.indexOf(response);
      if (index > -1) {
        userConnections.splice(index, 1);
      }
      if (userConnections.length === 0) {
        this.connections.delete(userId);
      }
    }
  }

  sendToUser(userId: string, data: any) {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      const message = `data: ${JSON.stringify(data)}\n\n`;
      userConnections.forEach(response => {
        try {
          response.write(message);
        } catch (error) {
          // Connection closed, remove it
          this.removeConnection(userId, response);
        }
      });
    }
  }

  sendToMultipleUsers(userIds: string[], data: any) {
    userIds.forEach(userId => this.sendToUser(userId, data));
  }

  sendToAll(data: any) {
    this.connections.forEach((_, userId) => {
      this.sendToUser(userId, data);
    });
  }
}
