export interface PromptContext {
  language?: string;
  crop?: string;
  district?: string;
  state?: string;
  soilType?: string;
  season?: string;
  userName?: string;
}

export class PromptBuilder {
  private systemPrompt = '';
  private userPrompt = '';
  private context: PromptContext = {};

  static create(): PromptBuilder {
    return new PromptBuilder();
  }

  setSystemPrompt(prompt: string): this {
    this.systemPrompt = prompt;
    return this;
  }

  setUserPrompt(prompt: string): this {
    this.userPrompt = prompt;
    return this;
  }

  setContext(context: PromptContext): this {
    this.context = { ...this.context, ...context };
    return this;
  }

  buildSystemInstruction(): string {
    let compiled = this.systemPrompt;
    compiled = compiled.replace(/{user_language}/g, this.context.language || 'mr');
    compiled = compiled.replace(/{crop_type}/g, this.context.crop || 'cotton');
    compiled = compiled.replace(/{user_district}/g, this.context.district || 'Yavatmal');
    compiled = compiled.replace(/{user_state}/g, this.context.state || 'maharashtra');
    compiled = compiled.replace(/{soil_type}/g, this.context.soilType || 'black');
    compiled = compiled.replace(/{user_name}/g, this.context.userName || 'शेतकरी मित्र');
    return compiled;
  }

  buildUserPrompt(): string {
    return this.userPrompt;
  }
}
