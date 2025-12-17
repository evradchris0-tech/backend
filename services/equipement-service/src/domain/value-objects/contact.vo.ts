/**
 * Value Object représentant les informations de contact
 */
export class Contact {
  private readonly _telephone: string;
  private readonly _email?: string;
  private readonly _telephoneSecondaire?: string;

  constructor(
    telephone: string,
    email?: string,
    telephoneSecondaire?: string,
  ) {
    this.validateTelephone(telephone);
    if (email) {
      this.validateEmail(email);
    }
    if (telephoneSecondaire) {
      this.validateTelephone(telephoneSecondaire);
    }

    this._telephone = telephone;
    this._email = email;
    this._telephoneSecondaire = telephoneSecondaire;
  }

  get telephone(): string {
    return this._telephone;
  }

  get email(): string | undefined {
    return this._email;
  }

  get telephoneSecondaire(): string | undefined {
    return this._telephoneSecondaire;
  }

  equals(other: Contact): boolean {
    return (
      this._telephone === other._telephone &&
      this._email === other._email &&
      this._telephoneSecondaire === other._telephoneSecondaire
    );
  }

  toString(): string {
    let result = `Tél: ${this._telephone}`;
    if (this._email) {
      result += ` | Email: ${this._email}`;
    }
    if (this._telephoneSecondaire) {
      result += ` | Tél 2: ${this._telephoneSecondaire}`;
    }
    return result;
  }

  toJSON() {
    return {
      telephone: this._telephone,
      email: this._email,
      telephoneSecondaire: this._telephoneSecondaire,
    };
  }

  static fromJSON(json: {
    telephone: string;
    email?: string;
    telephoneSecondaire?: string;
  }): Contact {
    return new Contact(json.telephone, json.email, json.telephoneSecondaire);
  }

  private validateTelephone(telephone: string): void {
    if (!telephone || telephone.trim().length === 0) {
      throw new Error('Le numéro de téléphone ne peut pas être vide');
    }
    // Format Cameroun: +237XXXXXXXXX ou 6XXXXXXXX
    const phoneRegex = /^(\+237)?[26]\d{8}$/;
    if (!phoneRegex.test(telephone.replace(/\s/g, ''))) {
      throw new Error(
        'Format de numéro de téléphone invalide (attendu: +237XXXXXXXXX ou 6XXXXXXXX)',
      );
    }
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Format d'email invalide");
    }
  }
}
