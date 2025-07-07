document.addEventListener('DOMContentLoaded', function() {
    const healthCheckData = [
        {
            category: "StoreFront Servers & Configuration",
            items: [
                "The user access FQDN resolves to a Load Balancing VIP with automatic datacenter failover (GSLB).",
                "The SSL certificate for the VIP is valid, trusted, and not expired.",
                "Communication from ADC to StoreFront servers is encrypted (HTTPS).",
                "The ADC monitor for StoreFront is of type STOREFRONT or checks '/Citrix/Store/discovery'.",
                "Load balancing persistence is SOURCEIP.",
                "If on the same hypervisor cluster, anti-affinity is configured to keep StoreFront servers on separate hosts.",
                "StoreFront server VMs have no old snapshots.",
                "StoreFront version is updated to resolve recent security vulnerabilities.",
                "StoreFront server group members have identical OS and patch levels, and latency is within recommended limits (<3ms with subscriptions).",
                "The StoreFront Base URL is an HTTPS address pointing to the load balancer.",
                "If Favorites (Subscriptions) are enabled, they are replicated to a disaster recovery site."
            ]
        },
        {
            category: "Delivery Controllers (DDCs) & Site",
            items: [
                "Citrix Scout Health Check shows no errors or warnings.",
                "Anti-affinity is configured to keep DDCs on separate hypervisor hosts.",
                "DDC VMs have no old snapshots.",
                "DDC version is a supported LTSR CU or one of the two latest Current Releases.",
                "SQL connection string points to an AlwaysOn Listener, not a single node, and includes 'MultiSubnetFailover'.",
                "SQL databases for Site, Monitoring, and Logging are separate.",
                "Local Host Cache is enabled, and DDCs use a single socket CPU configuration.",
                "SSL Certificates are installed on DDCs to encrypt XML traffic from StoreFront.",
                "'Trust XML Requests' is enabled for pass-through authentication and FAS.",
                "Citrix Studio Admins are audited and assigned via AD Groups, not individual users.",
                "Applications are published to AD Groups.",
                "The hypervisor connection uses a service account with minimum required permissions."
            ]
        },
        {
            category: "Remote Desktop Services (RDS) Licensing",
            items: [
                "At least two activated RDS Licensing servers are available for RDSH VDAs.",
                "RDS Licensing Server OS version matches or is newer than the RDSH VDA OS version.",
                "In RD Licensing Manager, 'Review Configuration' shows green checkmarks.",
                "The combined number of installed RDS CALs does not exceed the number of purchased licenses.",
                "On RDSH VDAs, GPO settings correctly point to the available license servers."
            ]
        },
        {
            category: "VDA - Master Image Build",
            items: [
                "Master Image build process is documented and automated (e.g., using BIS-F).",
                "Security scan of the Master Image shows compliance with enterprise security policies.",
                "VDA version is patched for the latest security vulnerabilities.",
                "Antivirus is installed and optimized for non-persistent (VDI) environments.",
                "Other IT agents (e.g., SCCM) are optimized for non-persistent machines.",
                "Citrix Optimizer or similar has been used to remove unnecessary components and optimize the OS.",
                "Windows Updates are current.",
                "Power management is set to High Performance.",
                "If using PVS, the pagefile is sized appropriately for the cache disk, and Event Logs are redirected.",
                "FSLogix is a recent version and is used for Outlook/Search roaming.",
                "Microsoft Teams is installed using the machine-wide installer and is periodically updated.",
                "For NVIDIA vGPU, the guest driver is installed before the VDA software."
            ]
        },
        {
            category: "Citrix Provisioning (PVS)",
            items: [
                "PVS Server version matches the DDC version.",
                "Multiple PVS servers are used for HA, with hypervisor anti-affinity.",
                "PVS servers have sufficient RAM for vDisk caching (2-3 GB per active vDisk).",
                "vDisks are in VHDX format, dynamically sized, and defragmented.",
                "Target Device boot method (PXE/DHCP) is highly available.",
                "Target Device write cache is configured for 'RAM with overflow to disk'.",
                "Target Devices are evenly distributed across PVS servers.",
                "The System Reserved Partition has been removed from inside the vDisk."
            ]
        },
        {
            category: "Policies (Group Policy & Citrix Policy)",
            items: [
                "VDAs are in dedicated OUs with Block Inheritance and Loopback Processing enabled.",
                ".admx templates in SYSVOL (Citrix, Office, etc.) are current.",
                "Citrix Policies are managed via GPO, not in both Studio and GPO.",
                "The legacy 'DisableGPCalculation' registry key does not exist, to ensure policies apply on reconnect.",
                "Client drive mapping, clipboard, and USB are disabled for external connections by default.",
                "Universal Print Driver is enforced to avoid installing native print drivers on VDAs.",
                "Audio quality is set to Medium to conserve bandwidth.",
                "Adaptive Transport (EDT) is enabled.",
                "Session Reliability is enabled."
            ]
        },
        {
            category: "Profile Management & WEM",
            items: [
                "Profile Management is configured via GPO, not WEM or Citrix Policy.",
                "The profile file share is highly available and close to the VDAs.",
                "No DFS multi-master replication is used for profile shares.",
                "NTFS permissions on the profile share grant users exclusive rights to their own folders.",
                "Profile streaming is enabled, and Active Write Back is disabled.",
                "AppData folder is NOT redirected.",
                "If using WEM, it is a recent version, deployed in HA, and agents point to an LB FQDN.",
                "In WEM, CPU Optimization and Fast Logoff are enabled.",
                "Unused WEM action types are disabled to speed up logons."
            ]
        }
    ];

    const form = document.getElementById('healthCheckForm');
    let formHtml = '';

    healthCheckData.forEach(section => {
        formHtml += `<div class="form-section"><h2>${section.category}</h2>`;
        formHtml += '<table><thead><tr><th>Check Item</th><th>Status</th><th>Notes</th></tr></thead><tbody>';
        
        section.items.forEach(item => {
            formHtml += `
                <tr>
                    <td>${item}</td>
                    <td>
                        <select>
                            <option value="">Select Status</option>
                            <option value="OK">OK</option>
                            <option value="Action Required">Action Required</option>
                            <option value="N/A">N/A</option>
                        </select>
                    </td>
                    <td><input type="text" placeholder="Notes..."></td>
                </tr>
            `;
        });

        formHtml += '</tbody></table></div>';
    });
    
    const clientDetails = form.querySelector('.client-details');
    clientDetails.insertAdjacentHTML('afterend', formHtml);
});

function generateReport() {
    const clientName = document.getElementById('clientName').value;
    const checkDate = document.getElementById('checkDate').value;
    const checkedBy = document.getElementById('checkedBy').value;
    const cvadVersion = document.getElementById('cvadVersion').value;

    let reportHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Health Check Report - ${clientName}</title>
            <style>
                body { font-family: Arial, sans-serif; }
                h1, h2 { color: #005696; }
                h1 { text-align: center; border-bottom: 2px solid #ccc; padding-bottom: 10px; }
                h2 { border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 30px;}
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .status-ok { color: green; font-weight: bold; }
                .status-issue { color: red; font-weight: bold; }
                .client-details-table { border: none; width: auto; margin-bottom: 30px; }
                .client-details-table td { border: none; padding: 5px; }
                .client-details-table td:first-child { font-weight: bold; padding-right: 15px; }
                 @media print {
                    button { display: none; }
                 }
            </style>
        </head>
        <body>
            <h1>Citrix Virtual Apps & Desktops - Health Check Report</h1>
            <table class="client-details-table">
                <tr><td>Customer Name:</td><td>${clientName}</td></tr>
                <tr><td>Date of Check:</td><td>${new Date(checkDate).toLocaleDateString('en-US')}</td></tr>
                <tr><td>Checked By:</td><td>${checkedBy}</td></tr>
                <tr><td>CVAD Version:</td><td>${cvadVersion}</td></tr>
            </table>
            <hr>
    `;

    const sections = document.querySelectorAll('.form-section:not(.client-details)');
    sections.forEach(section => {
        const title = section.querySelector('h2').innerText;
        reportHtml += `<h2>${title}</h2>`;
        reportHtml += '<table><thead><tr><th>Check Item</th><th>Status</th><th>Notes</th></tr></thead><tbody>';
        
        const rows = section.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const check = row.cells[0].innerText;
            const status = row.cells[1].querySelector('select').value;
            const notes = row.cells[2].querySelector('input').value;
            
            let statusClass = '';
            if (status === 'OK') statusClass = 'status-ok';
            if (status === 'Action Required') statusClass = 'status-issue';

            reportHtml += `
                <tr>
                    <td>${check}</td>
                    <td class="${statusClass}">${status}</td>
                    <td>${notes}</td>
                </tr>
            `;
        });
        reportHtml += '</tbody></table>';
    });
    
    reportHtml += `<p style="margin-top: 40px; text-align: center; color: #555;">-- End of Report --</p></body></html>`;

    const reportWindow = window.open('', '_blank');
    reportWindow.document.write(reportHtml);
    reportWindow.document.close();
    setTimeout(() => {
        reportWindow.print();
    }, 500);
}