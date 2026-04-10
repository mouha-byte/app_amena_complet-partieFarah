import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../core/services/chatbot.service';

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="max-width:800px;height:calc(100vh - 130px);display:flex;flex-direction:column">
      <div style="margin-bottom:16px">
        <h1 style="font-size:24px;font-weight:700">Chatbot IA</h1>
        <p style="color:#64748b;font-size:14px">Assistant intelligent pour la maladie d'Alzheimer</p>
      </div>

      <div class="card-alzcare" style="flex:1;display:flex;flex-direction:column;overflow:hidden;padding:0">
        <!-- Messages -->
        <div #scrollContainer style="flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:12px">
          @if (messages.length === 0) {
            <div style="text-align:center;padding:48px;color:#94a3b8">
              <i class="fa-solid fa-robot" style="font-size:48px;margin-bottom:16px"></i>
              <p>Posez-moi vos questions sur la maladie d'Alzheimer</p>
              <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;justify-content:center">
                @for (q of suggestions; track q) {
                  <button style="background:#eff6ff;color:#3b82f6;border:1px solid #bfdbfe;border-radius:20px;padding:8px 16px;font-size:13px;cursor:pointer" (click)="sendSuggestion(q)">{{ q }}</button>
                }
              </div>
            </div>
          }

          @for (msg of messages; track msg.timestamp) {
            <div [style.align-self]="msg.role === 'user' ? 'flex-end' : 'flex-start'">
              <div [class]="msg.role === 'user' ? 'chat-user' : 'chat-bot'">
                <p style="font-size:14px;line-height:1.6;white-space:pre-wrap">{{ msg.content }}</p>
              </div>
              <div style="font-size:11px;color:#94a3b8;margin-top:4px" [style.text-align]="msg.role === 'user' ? 'right' : 'left'">
                {{ msg.timestamp | date:'HH:mm' }}
              </div>
            </div>
          }

          @if (loading) {
            <div style="align-self:flex-start">
              <div class="chat-bot" style="display:flex;align-items:center;gap:8px">
                <div class="spinner" style="width:16px;height:16px;border-width:2px"></div>
                <span style="font-size:14px;color:#64748b">En train de réfléchir...</span>
              </div>
            </div>
          }
        </div>

        <!-- Input -->
        <div style="border-top:1px solid #e2e8f0;padding:16px;display:flex;gap:12px">
          <input class="form-input" style="flex:1" [(ngModel)]="input" placeholder="Tapez votre message..." (keyup.enter)="send()" [disabled]="loading">
          <button class="btn-primary-alz" (click)="send()" [disabled]="loading || !input.trim()">
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ChatPage implements AfterViewChecked {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  messages: ChatMessage[] = [];
  input = '';
  loading = false;
  suggestions = [
    'Qu\'est-ce que l\'Alzheimer ?',
    'Comment aider un patient ?',
    'Quels sont les symptômes ?',
    'Conseils pour aidants'
  ];

  constructor(private chatbotService: ChatbotService) {}

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendSuggestion(text: string): void {
    this.input = text;
    this.send();
  }

  send(): void {
    if (!this.input.trim() || this.loading) return;
    const text = this.input.trim();
    this.messages.push({ role: 'user', content: text, timestamp: new Date() });
    this.input = '';
    this.loading = true;

    this.chatbotService.sendMessage(text).subscribe({
      next: (res: any) => {
        this.messages.push({ role: 'bot', content: res.reply || res.message || res, timestamp: new Date() });
        this.loading = false;
      },
      error: () => {
        this.messages.push({ role: 'bot', content: 'Désolé, une erreur est survenue. Réessayez.', timestamp: new Date() });
        this.loading = false;
      }
    });
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (e) { /* ignore */ }
  }
}
