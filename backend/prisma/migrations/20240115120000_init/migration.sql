-- CreateTable
CREATE TABLE "solicitudes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "monto" REAL NOT NULL,
    "plazoMeses" INTEGER NOT NULL,
    "cuotaMensual" REAL NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "solicitudes_estado_idx" ON "solicitudes"("estado");
