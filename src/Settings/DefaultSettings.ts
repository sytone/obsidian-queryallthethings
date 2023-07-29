
export interface ISqlSettings {
  onStartSqlQueries: string;
}

export const SqlSettingsDefaults: ISqlSettings = {
  onStartSqlQueries: 'SELECT * FROM sqlite_master;',
};

export interface IGeneralSettings {
  onStartSqlQueries: string;
}

export const GeneralSettingsDefaults: IGeneralSettings = {
  onStartSqlQueries: 'SELECT * FROM sqlite_master;',
};

