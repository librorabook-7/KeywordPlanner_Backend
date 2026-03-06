using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KeywordPlannerAPI.Helper
{
    public class SqlDataAccess
    {
        public const string CONNECTION_STRING_NAME = "connectionString";

        private static string _ConnectionString = string.Empty;

        //Returns the connection
        public static string ConnectionString
        {
            get
            {
                if (_ConnectionString == string.Empty)
                {
                    return _ConnectionString = ConfigurationManager.ConnectionStrings[CONNECTION_STRING_NAME].ConnectionString;
                }
                return _ConnectionString;
            }
        }

        /// <summary>
        /// returns the SqlCommand object to be able to add some parameters in it. After you send this to Execute method.
        /// </summary>
        /// <param name="sql"></param>
        /// <param name="sqlcommandtype"></param>
        /// <returns></returns>
        public SqlCommand GetCommand(string sql, CommandType sqlcommandtype = CommandType.Text)
        {
            SqlConnection conn = new SqlConnection(ConnectionString);
            SqlCommand sqlCmd = new SqlCommand(sql, conn);
            sqlCmd.CommandType = sqlcommandtype;
            return sqlCmd;
        }

        /// <summary>
        /// return datatabale when provided some query.
        /// </summary>
        /// <param name="sql"></param>
        /// <returns></returns>
        public DataTable Execute(string sql)
        {
            DataTable table = new DataTable();
            SqlCommand cmd = GetCommand(sql);
            cmd.Connection.Open();
            table.Load(cmd.ExecuteReader());
            cmd.Connection.Close();
            return table;
        }

        /// <summary>
        /// return datatable when provided with the command.
        /// </summary>
        /// <param name="command"></param>
        /// <returns></returns>
        public DataTable Execute(SqlCommand command)
        {
            DataTable table = new DataTable();
            command.Connection.Open();
            using (var sqlDataAdapter = new SqlDataAdapter(command))
            {
                sqlDataAdapter.Fill(table);
            }
            command.Connection.Close();
            return table;
        }

        /// <summary>
        /// return SqlDataReader when provided with sql Query.
        /// </summary>
        /// <param name="sql"></param>
        /// <returns></returns>
        public SqlDataReader ExecuteReader(string sql)
        {
            SqlCommand cmd = GetCommand(sql);
            cmd.Connection.Open();
            SqlDataReader reader = cmd.ExecuteReader();
            cmd.Connection.Close();
            return reader;
        }

        /// <summary>
        /// returns SqlDataReader when Provided with the Sql Qquery.
        /// </summary>
        /// <param name="command"></param>
        /// <returns></returns>
        public SqlDataReader ExecuteReader(SqlCommand command)
        {
            command.Connection.Open();
            SqlDataReader reader = command.ExecuteReader();
            command.Connection.Close();
            return reader;
        }

        /// <summary>
        /// return result when provided the sql to Execute.
        /// </summary>
        /// <param name="sql"></param>
        /// <returns></returns>
        public int ExecuteNonQuery(string sql)
        {
            SqlCommand command = GetCommand(sql);
            command.Connection.Open();
            int result = command.ExecuteNonQuery();
            command.Connection.Close();
            return result;
        }

        /// <summary>
        /// retuens the result when provided with the command.
        /// </summary>
        /// <param name="command"></param>
        /// <returns></returns>
        public int ExecuteNonQuery(SqlCommand command)
        {
            command.Connection.Open();
            int result = command.ExecuteNonQuery();
            command.Connection.Close();
            return result;
        }

        /// <summary>
        /// return results when provided the Stored Procedure Name
        /// </summary>
        /// <param name="spName"></param>
        /// <returns></returns>
        public int ExecuteStoredProcedure(string spName)
        {
            SqlCommand command = GetCommand(spName);
            command.CommandType = CommandType.StoredProcedure;
            command.Connection.Open();
            int result = command.ExecuteNonQuery();
            command.Connection.Close();
            return result;
        }

        /// <summary>
        /// returns the result when provided with the command to execute stored procedure.
        /// </summary>
        /// <param name="command"></param>
        /// <returns></returns>
        public int ExecuteStoredProcedure(SqlCommand command)
        {
            command.CommandType = CommandType.StoredProcedure;
            command.Connection.Open();
            int result = command.ExecuteNonQuery();
            command.Connection.Close();
            return result;
        }
    }
}