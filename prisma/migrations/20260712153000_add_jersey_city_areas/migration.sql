-- Add five key Jersey City areas to the Neighborhood enum.
ALTER TYPE "Neighborhood" ADD VALUE IF NOT EXISTS 'DowntownJerseyCity';
ALTER TYPE "Neighborhood" ADD VALUE IF NOT EXISTS 'Newport';
ALTER TYPE "Neighborhood" ADD VALUE IF NOT EXISTS 'JournalSquare';
ALTER TYPE "Neighborhood" ADD VALUE IF NOT EXISTS 'JerseyCityHeights';
ALTER TYPE "Neighborhood" ADD VALUE IF NOT EXISTS 'GroveStreet';
