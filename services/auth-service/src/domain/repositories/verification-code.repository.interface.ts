export type VerificationCodeData = {
    code: string;
    email: string;
    type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
    expiresAt: Date;
    createdAt?: Date;
};

export interface IVerificationCodeRepository {
    /**
     * Persiste un code de vérification.
     * Doit retourner l'enregistrement créé.
     */
    save(data: VerificationCodeData): Promise<VerificationCodeData>;

    /**
     * Recherche un code par sa valeur (string).
     * Retourne undefined si non trouvé ou expiré (la logique d'expiration peut être gérée ici ou côté service).
     */
    findByCode(code: string): Promise<VerificationCodeData | undefined>;

    /**
     * Supprime un code (par ex. après validation).
     */
    delete(code: string): Promise<void>;

    /**
     * Purge des codes expirés — utile pour cron jobs.
     */
    deleteExpired(now?: Date): Promise<number>; // retourne nombre de lignes supprimées
}
