import multer, { StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';
import { IAuthRequest } from '../interfaces/IAuthRequest.js';

/**
 * @function ensureUserDirExists
 * @description Garante que um diretório de upload específico para o usuário exista.
 */
const ensureUserDirExists = (userId: string | number): string => {
    const userDirPath = path.join('uploads', userId.toString()); 
    
    if (!fs.existsSync(userDirPath)) {
        fs.mkdirSync(userDirPath, { recursive: true }); 
    }
    return userDirPath;
};

// Configuração de armazenamento do Multer
const storage: StorageEngine = multer.diskStorage({
    destination: function (req: IAuthRequest, file, cb) {
        // Verificação de segurança: o usuário precisa estar logado
        if (!req.user || !req.user.id) {
            return cb(new Error('Usuário não autenticado para upload'), '');
        }
        
        const userDirPath = ensureUserDirExists(req.user.id); 
        cb(null, userDirPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); 
    }
});

const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf']);

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ALLOWED_MIME_TYPES.has(file.mimetype) && ALLOWED_EXTENSIONS.has(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo não permitido. Apenas imagens JPEG, PNG, WEBP e documentos PDF são aceitos.'));
        }
    }
});

// Exportação padrão do middleware configurado para um único arquivo
// Usamos 'any' aqui para evitar conflitos de tipos internos do Multer com Express
const uploadMiddleware = upload.single('file');

export default uploadMiddleware;