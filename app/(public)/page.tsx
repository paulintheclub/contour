import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Contour
        </h1>
        <p className="text-2xl text-gray-700 dark:text-gray-300 mb-4">
          Система управления туристическими организациями
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          Платформа для мониторинга заявок на туры, управления расписанием и
          координации работы команды. Создавайте организации, управляйте
          пользователями и турами в одном месте.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg transition-colors"
          >
            Войти в систему
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Многоорганизационность
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Поддержка множества туристических организаций с изолированными
              данными
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Управление ролями
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Гибкая система прав доступа: администраторы, менеджеры и гиды
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Централизованный контроль
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Единая панель для управления турами, расписанием и отчётами
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
