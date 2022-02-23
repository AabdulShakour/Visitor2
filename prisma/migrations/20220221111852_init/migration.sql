BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [email] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000),
    CONSTRAINT [User_pkey] PRIMARY KEY ([id]),
    CONSTRAINT [User_email_key] UNIQUE ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Post] (
    [id] INT NOT NULL IDENTITY(1,1),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Post_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(1000),
    [published] BIT NOT NULL CONSTRAINT [Post_published_df] DEFAULT 0,
    [viewCount] INT NOT NULL CONSTRAINT [Post_viewCount_df] DEFAULT 0,
    [authorId] INT,
    CONSTRAINT [Post_pkey] PRIMARY KEY ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Visiter] (
    [id] INT NOT NULL IDENTITY(1,1),
    [email] NVARCHAR(1000) NOT NULL,
    [fullname] NVARCHAR(1000),
    [job_description] NVARCHAR(1000) NOT NULL,
    [destination] NVARCHAR(1000) NOT NULL,
    [mobile] NVARCHAR(1000) NOT NULL,
    [genderId] INT,
    [hoster_Name] NVARCHAR(1000) NOT NULL,
    [hoster_Department] NVARCHAR(1000) NOT NULL,
    [hoster_Hoster_Directorate] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Visiter_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updateAt] DATETIME2 NOT NULL,
    [updatedby] INT NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [Visiter_isActive_df] DEFAULT 1,
    [profileId] INT,
    CONSTRAINT [Visiter_pkey] PRIMARY KEY ([id]),
    CONSTRAINT [Visiter_email_key] UNIQUE ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Profile] (
    [id] INT NOT NULL IDENTITY(1,1),
    [type] NVARCHAR(1000),
    CONSTRAINT [Profile_pkey] PRIMARY KEY ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Gender] (
    [id] INT NOT NULL IDENTITY(1,1),
    [type] NVARCHAR(1000),
    CONSTRAINT [Gender_pkey] PRIMARY KEY ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Owner] (
    [id] INT NOT NULL IDENTITY(1,1),
    [email] NVARCHAR(1000) NOT NULL,
    [fullname] NVARCHAR(1000),
    [password] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Owner_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updateAt] DATETIME2 NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [Owner_isActive_df] DEFAULT 1,
    CONSTRAINT [Owner_pkey] PRIMARY KEY ([id]),
    CONSTRAINT [Owner_email_key] UNIQUE ([email])
);

-- AddForeignKey
ALTER TABLE [dbo].[Post] ADD CONSTRAINT [Post_authorId_fkey] FOREIGN KEY ([authorId]) REFERENCES [dbo].[User]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Visiter] ADD CONSTRAINT [Visiter_profileId_fkey] FOREIGN KEY ([profileId]) REFERENCES [dbo].[Profile]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Visiter] ADD CONSTRAINT [Visiter_genderId_fkey] FOREIGN KEY ([genderId]) REFERENCES [dbo].[Gender]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Visiter] ADD CONSTRAINT [Visiter_createdby_fkey] FOREIGN KEY ([createdby]) REFERENCES [dbo].[Owner]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
