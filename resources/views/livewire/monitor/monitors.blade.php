<div>

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Monitor') }}

        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                <div class="p-6 flex flex-wrap">
                    {{-- start here --}}
                    <div class="w-full ">
                        <div class="relative rounded-xl overflow-auto">
                            <div class="tracking-widest text-xs title-font mb-1 uppercase text-center leading-6">
                                <div class="flex items-stretch gap-4 w-full rounded-lg bg-stripes-cyan text-center">
                                    <div class="flex-1 flex">

                                        {{-- @dd($this->getProcessInformation()) --}}

                                        Estado:
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                            class="h-6 w-6 inline text-green-400 font-bold" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                                        </svg>
                                    </div>
                                    <div class=" flex-1 flex items-center justify-end">
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                            class="h-6 w-6 inline cursor-pointer mx-3" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                            class="h-6 w-6 inline cursor-pointer mx-3" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                        </svg>
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                            class="h-6 w-6 inline cursor-pointer mx-3" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="w-1/4">
                            <div class="w-full">



                            </div>
                        </div>
                    </div>
                    <div class="p-4 md:w-1/3 w-full">
                        <div class="h-full border-2 border-gray-200 border-opacity-60 rounded-lg overflow-hidden p-7">
                            <div class="w-full">
                                <div class="w-full flex">
                                    <div class="w-full text-center text-2xl">
                                        <span class="text-green-400 font-bold">
                                            5 seg
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="pt-6 mt-2">
                                <h2 class="tracking-widest text-xs title-font mb-1 uppercase text-center">
                                    Tiempo de Ejecución de Revisión
                                </h2>
                            </div>
                        </div>
                    </div>

                    <div class="p-4 md:w-1/3 w-full">
                        <div class="h-full border-2 border-gray-200 border-opacity-60 rounded-lg overflow-hidden p-7">
                            <div class="w-full">
                                <div class="w-full flex">
                                    <div class="w-full text-center text-2xl">
                                        <span class="text-green-400 font-bold">
                                            5 seg
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="pt-6 mt-2">
                                <h2 class="tracking-widest text-xs title-font mb-1 uppercase text-center">
                                    Tiempo de Ejecución Total por Ciclo
                                </h2>
                            </div>
                        </div>
                    </div>

                    <div class="p-4 md:w-1/3 w-full">
                        <div class="h-full border-2 border-gray-200 border-opacity-60 rounded-lg overflow-hidden p-7">
                            <div class="w-full">
                                <div class="w-full flex">
                                    <div class="w-full text-center text-2xl">
                                        <span class="text-green-400 font-bold">
                                            10
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="pt-6 mt-2">
                                <h2 class="tracking-widest text-xs title-font mb-1 uppercase text-center">
                                    Notificaciones (ultimas 24h)
                                </h2>
                            </div>
                        </div>
                    </div>

                    <div class="p-4 w-full">
                        <div class="h-full border-2 border-gray-200 border-opacity-60 rounded-lg overflow-hidden p-7">
                            <h2 class="tracking-widest text-xs title-font mb-1 uppercase text-left">
                                Trabajadores conectados
                            </h2>
                            <div
                                class="w-full md:w-4/5 mx-auto bg-white shadow-lg  border border-gray-200 rounded-lg mt-4">
                                <div class="p-3">
                                    <div class="overflow-x-auto">
                                        <table class="table-auto w-full text-center">
                                            <thead class="text-xs font-semibold uppercase text-gray-400 bg-gray-50">
                                                <tr>
                                                    <th class="p-2 whitespace-nowrap">
                                                        <div class="font-semibold ">#</div>
                                                    </th>
                                                    <th class="p-2 whitespace-nowrap">
                                                        <div class="font-semibold ">Proxy</div>
                                                    </th>
                                                    <th class="p-2 whitespace-nowrap">
                                                        <div class="font-semibold ">Ubicación</div>
                                                    </th>
                                                    <th class="p-2 whitespace-nowrap">
                                                        <div class="font-semibold">
                                                            <svg xmlns="http://www.w3.org/2000/svg"
                                                                class="h-6 w-6 inline" fill="none" viewBox="0 0 24 24"
                                                                stroke="currentColor" stroke-width="2">
                                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            obtener datos

                                                        </div>
                                                    </th>
                                                    <th class="p-2 whitespace-nowrap">
                                                        <div class="font-semibold ">
                                                            <svg xmlns="http://www.w3.org/2000/svg"
                                                                class="h-6 w-6 inline" fill="none" viewBox="0 0 24 24"
                                                                stroke="currentColor" stroke-width="2">
                                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            enviar datos
                                                        </div>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody class="text-sm divide-y divide-gray-100">
                                                <tr>
                                                    <td class="p-2 whitespace-nowrap">
                                                        <div>1</div>
                                                    </td>
                                                    <td class="p-2 whitespace-nowrap">
                                                        <div>Colombia</div>
                                                    </td>
                                                    <td class="p-2 whitespace-nowrap">
                                                        <div>VPS</div>
                                                    </td>

                                                    <td class="p-2 whitespace-nowrap">
                                                        <div>3 seg</div>
                                                    </td>
                                                    <td class="p-2 whitespace-nowrap">
                                                        <div class="">4 seg</div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                        </div>



                    </div>

                    {{-- end here --}}
                </div>
            </div>
        </div>
    </div>
</div>
