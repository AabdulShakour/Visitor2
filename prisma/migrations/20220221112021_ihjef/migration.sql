BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Owner] ADD CONSTRAINT [Owner_updateAt_df] DEFAULT CURRENT_TIMESTAMP FOR [updateAt];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
